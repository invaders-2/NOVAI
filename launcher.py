#!/usr/bin/env python3
"""NOVAI 桌面启动器 — PyInstaller 打包入口

启动流程：
1. 找到安装目录（exe 所在目录）
2. 将安装目录加入 sys.path，动态加载外置 main.py
3. 用内置 uvicorn 启动 FastAPI 服务（后台线程）
4. 等待服务就绪后打开原生桌面窗口
"""

import os
import sys
import time
import threading


def hide_console():
    """在 --console 模式下打包后，启动时隐藏控制台窗口"""
    if os.name == "nt" and getattr(sys, "frozen", False):
        try:
            import ctypes
            hwnd = ctypes.windll.kernel32.GetConsoleWindow()
            if hwnd:
                ctypes.windll.user32.ShowWindow(hwnd, 0)  # SW_HIDE
        except Exception:
            pass


def get_app_dir() -> str:
    """获取安装目录（exe 所在目录，即 main.py 等外置文件所在位置）

    onefile 模式下 sys._MEIPASS 是临时解压目录（含 Python 运行时和打包依赖），
    但 main.py 是外置的（在 exe 旁边，方便在线更新），不在 _MEIPASS 里。
    所以优先用 exe 所在目录，找不到 main.py 才回退到 _MEIPASS。
    """
    if getattr(sys, "frozen", False):
        exe_dir = os.path.dirname(sys.executable)
        if os.path.isfile(os.path.join(exe_dir, "main.py")):
            return exe_dir
        # fallback：可能 main.py 被打包进 exe 了（onedir 或 add-data 场景）
        return getattr(sys, '_MEIPASS', exe_dir)
    return os.path.dirname(os.path.abspath(__file__))


def main():
    hide_console()
    app_dir = get_app_dir()
    
    # 写启动日志
    log_file = os.path.join(os.environ.get("TEMP", "."), "novai_startup.log")
    def log(msg):
        try:
            with open(log_file, "a", encoding="utf-8") as f:
                f.write(f"[{time.strftime('%H:%M:%S')}] {msg}\n")
        except:
            pass
    
    log(f"App dir: {app_dir}")
    log(f"Frozen: {getattr(sys, 'frozen', False)}")
    log(f"Python: {sys.version}")
    log(f"sys.path[0:3]: {sys.path[:3]}")

    # 确保安装目录在 sys.path 最前面，优先加载外置 main.py
    if app_dir not in sys.path:
        sys.path.insert(0, app_dir)

    # 设置环境变量供 main.py 使用
    data_dir = os.path.join(
        os.environ.get("APPDATA", os.path.expanduser("~")),
        "NOVAI"
    )
    os.environ.setdefault("NOVAI_APP_DIR", app_dir)
    os.environ.setdefault("NOVAI_DATA_DIR", data_dir)
    os.makedirs(data_dir, exist_ok=True)

    # 动态加载外置 main.py
    try:
        log("Importing main.py...")
        import main as main_module
        log("main.py imported OK")
    except ImportError as e:
        log(f"Import FAILED: {e}")
        import tkinter.messagebox as mb
        mb.showerror("启动失败",
                     f"无法加载 main.py\n\n请确认 {app_dir}\\main.py 存在且完整。\n\n错误: {e}")
        sys.exit(1)

    PORT = 3000
    URL = f"http://127.0.0.1:{PORT}"  # 桌面窗口仍用 127.0.0.1 本地访问

    # 获取局域网 IP，供 main.py 的 /api/lan-info 接口使用
    def get_lan_ip():
        import socket
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        try:
            s.connect(("8.8.8.8", 80))
            return s.getsockname()[0]
        except Exception:
            return None
        finally:
            s.close()

    lan_ip = get_lan_ip()
    if lan_ip:
        lan_url = f"http://{lan_ip}:{PORT}"
        os.environ["NOVAI_LAN_URL"] = lan_url
        os.environ["NOVAI_LAN_IP"] = lan_ip
        log(f"LAN access: {lan_url}")
    else:
        log("LAN access: unable to detect local IP")

    # 后台线程启动 uvicorn
    import uvicorn

    server_started = threading.Event()

    def run_server():
        config = uvicorn.Config(
            main_module.app,
            host="0.0.0.0",  # 绑定所有网卡，允许局域网访问
            port=PORT,
            log_level="warning",
            log_config=None,
            loop="asyncio",
        )
        server = uvicorn.Server(config)

        # 在事件循环启动后通知主线程
        async def notify():
            server_started.set()

        # 把 notify 加到 startup
        original_startup = getattr(server, "_serve", None)

        # 简单方案：另开线程检测
        def check_and_notify():
            import urllib.request
            for _ in range(30):
                try:
                    urllib.request.urlopen(URL, timeout=1)
                    server_started.set()
                    return
                except Exception:
                    time.sleep(0.3)
            server_started.set()  # 超时也通知，避免卡死

        threading.Thread(target=check_and_notify, daemon=True).start()
        log("Starting uvicorn server...")
        try:
            server.run()
        except Exception as e:
            log(f"Server run FAILED: {e}")
            import traceback
            log(traceback.format_exc())
            server_started.set()  # unlock main thread

    server_thread = threading.Thread(target=run_server, daemon=True)
    log("Starting server thread...")
    server_thread.start()

    # 等待服务就绪
    log("Waiting for server...")
    if not server_started.wait(timeout=20):
        log("Server wait TIMEOUT!")
        try:
            import tkinter.messagebox as mb
            mb.showerror("启动失败", "后端服务启动超时，请检查网络或防火墙设置。")
        except Exception:
            pass
        sys.exit(1)
    log("Server ready!")

    # 打开原生桌面窗口
    try:
        import webview

        # ===== 窗口控制 API ====
        class Api:
            def __init__(self):
                self._maximized = False

            def minimize(self):
                webview.windows[0].minimize()

            def maximize(self):
                if os.name == "nt":
                    import ctypes
                    hwnd = ctypes.windll.user32.GetForegroundWindow()
                    if self._maximized:
                        ctypes.windll.user32.ShowWindow(hwnd, 1)  # SW_NORMAL
                        self._maximized = False
                    else:
                        ctypes.windll.user32.ShowWindow(hwnd, 3)  # SW_MAXIMIZE
                        self._maximized = True

            def close(self):
                # 关闭按钮改为隐藏窗口（最小化到托盘），不退出应用
                try:
                    webview.windows[0].hide()
                except Exception as e:
                    log(f"close hide error: {e}")

        def _enable_frameless_resize(retries=12, delay=0.4):
            """子类化窗口 WndProc 实现无标题栏 + resize 边框。
            优先通过 pywebview window.native 获取 HWND（最可靠），回退 EnumWindows。"""
            import ctypes
            import time
            from ctypes import wintypes, WINFUNCTYPE
            user32 = ctypes.windll.user32
            hwnd = None

            # ── 方法1：pywebview window.native.Handle（推荐）──
            for attempt in range(retries):
                try:
                    wins = webview.windows
                    if wins:
                        w = wins[0]
                        native = getattr(w, 'native', None)
                        if native:
                            hwnd = int(native.Handle.ToInt32())
                            break
                except Exception:
                    pass
                time.sleep(delay)

            if hwnd:
                log(f"_enable_frameless_resize: native → hwnd={hwnd}")
            else:
                # ── 方法2：EnumWindows 回退 ──
                log("_enable_frameless_resize: native not ready, trying EnumWindows...")
                kernel32 = ctypes.windll.kernel32
                pid = kernel32.GetCurrentProcessId()
                found = [None]

                @WINFUNCTYPE(wintypes.BOOL, wintypes.HWND, wintypes.LPARAM)
                def enum_cb(h, _lp):
                    proc_id = wintypes.DWORD()
                    user32.GetWindowThreadProcessId(h, ctypes.byref(proc_id))
                    if proc_id.value == pid and user32.IsWindowVisible(h):
                        cn = ctypes.create_unicode_buffer(256)
                        user32.GetClassNameW(h, cn, 256)
                        if "ConsoleWindowClass" not in cn.value and "#32770" not in cn.value:
                            found[0] = h
                            return False
                    return True

                for attempt in range(retries):
                    found[0] = None
                    user32.EnumWindows(enum_cb, 0)
                    if found[0]:
                        hwnd = found[0]
                        break
                    log(f"_enable_frameless_resize: EnumWindows retry {attempt+1}/{retries}")
                    time.sleep(delay)

                # 保留回调引用防止 GC
                _enable_frameless_resize._enum_cb = enum_cb

            if not hwnd:
                log("_enable_frameless_resize: no window found after all retries")
                return

            # ── 设置 64 位兼容的函数原型 ──
            # ctypes 默认返回 c_int（32 位），64 位指针会被截断导致崩溃
            user32.SetWindowLongPtrW.restype = ctypes.c_longlong
            user32.SetWindowLongPtrW.argtypes = [wintypes.HWND, ctypes.c_int, ctypes.c_longlong]
            user32.GetWindowLongPtrW.restype = ctypes.c_longlong
            user32.GetWindowLongPtrW.argtypes = [wintypes.HWND, ctypes.c_int]
            user32.CallWindowProcW.restype = ctypes.c_longlong
            user32.CallWindowProcW.argtypes = [ctypes.c_longlong, wintypes.HWND, wintypes.UINT, wintypes.WPARAM, wintypes.LPARAM]

            try:
                # ── WndProc 子类化：拦截 WM_NCCALCSIZE 去掉标题栏区域 ──
                WM_NCCALCSIZE = 0x0083
                orig_wndproc = [None]

                @WINFUNCTYPE(ctypes.c_longlong, wintypes.HWND, wintypes.UINT, wintypes.WPARAM, wintypes.LPARAM)
                def new_wndproc(h, msg, wp, lp):
                    if msg == WM_NCCALCSIZE and wp:
                        return 0
                    return user32.CallWindowProcW(orig_wndproc[0], h, msg, wp, lp)

                GWLP_WNDPROC = -4
                orig_wndproc[0] = user32.SetWindowLongPtrW(hwnd, GWLP_WNDPROC,
                    ctypes.cast(new_wndproc, ctypes.c_void_p).value)
                log(f"_enable_frameless_resize: SetWindowLongPtrW ok, orig_wndproc={orig_wndproc[0]}")

                # 移除 WS_CAPTION，添加 WS_THICKFRAME（resize 边框）
                WS_CAPTION = 0x00C00000
                WS_THICKFRAME = 0x00040000
                GWL_STYLE = -16
                style = user32.GetWindowLongPtrW(hwnd, GWL_STYLE)
                style &= ~WS_CAPTION
                style |= WS_THICKFRAME
                user32.SetWindowLongPtrW(hwnd, GWL_STYLE, style)

                # 触发重绘（不改变大小和位置）
                SWP_NOMOVE = 0x0002
                SWP_NOSIZE = 0x0001
                SWP_FRAMECHANGED = 0x0020
                SWP_NOZORDER = 0x0004
                user32.SetWindowPos(hwnd, 0, 0, 0, 0, 0,
                    SWP_NOMOVE | SWP_NOSIZE | SWP_FRAMECHANGED | SWP_NOZORDER)

                # 保留 WndProc 引用防止 GC 崩溃
                _enable_frameless_resize._wndproc = new_wndproc
                _enable_frameless_resize._orig = orig_wndproc[0]

                log(f"_enable_frameless_resize: subclassed hwnd={hwnd} + WS_THICKFRAME added")
            except Exception as e:
                log(f"_enable_frameless_resize: subclass FAILED: {e}")
                # 回退：仅添加 WS_THICKFRAME 不做子类化
                try:
                    style = user32.GetWindowLongW(hwnd, -16)
                    style |= 0x00040000  # WS_THICKFRAME
                    user32.SetWindowLongW(hwnd, -16, style)
                    user32.SetWindowPos(hwnd, 0, 0, 0, 0, 0, 0x0020 | 0x0002 | 0x0001 | 0x0004)
                    log(f"_enable_frameless_resize: fallback WS_THICKFRAME only, hwnd={hwnd}")
                except Exception as e2:
                    log(f"_enable_frameless_resize: fallback also failed: {e2}")

        # ===== 系统托盘图标 =====
        _tray_icon_ref = [None]

        def _start_tray_icon():
            """启动系统托盘图标（后台线程中运行，阻塞）"""
            try:
                import pystray
            except Exception as e:
                log(f"tray: pystray import failed: {type(e).__name__}: {e}")
                return
            try:
                from PIL import Image
            except Exception as e:
                log(f"tray: PIL import failed: {type(e).__name__}: {e}")
                return

            # 加载图标
            icon_path = os.path.join(app_dir, "static", "images", "icon.ico")
            try:
                image = Image.open(icon_path) if os.path.isfile(icon_path) else Image.new('RGB', (64, 64), color=(99, 102, 241))
            except Exception:
                image = Image.new('RGB', (64, 64), color=(99, 102, 241))

            def on_show(icon, item):
                try:
                    wins = webview.windows
                    if wins:
                        wins[0].show()
                        wins[0].restore()
                except Exception as e:
                    log(f"tray on_show error: {e}")

            def on_quit(icon, item):
                try:
                    icon.stop()
                    wins = webview.windows
                    if wins:
                        wins[0].destroy()
                except Exception as e:
                    log(f"tray on_quit error: {e}")

            menu = pystray.Menu(
                pystray.MenuItem("显示窗口", on_show, default=True),
                pystray.MenuItem("退出 NOVAI", on_quit)
            )
            icon = pystray.Icon("NOVAI", image, "NOVAI", menu)
            _tray_icon_ref[0] = icon
            log("tray icon started")
            icon.run()

        # 读版本号
        version = "1.0"
        version_file = os.path.join(app_dir, "VERSION")
        if os.path.isfile(version_file):
            try:
                with open(version_file, encoding="utf-8") as f:
                    version = f.read().strip()
            except Exception:
                pass

        api = Api()
        window = webview.create_window(
            title="",
            url=URL,
            width=1400,
            height=900,
            min_size=(800, 600),
            resizable=True,
            fullscreen=False,
            frameless=True,
            easy_drag=False,
            js_api=api,
        )
        # 启动系统托盘图标（后台线程）
        threading.Thread(target=_start_tray_icon, daemon=True).start()
        # 纯 Win32 移除标题栏 + 补 resize 边框
        if os.name == "nt":
            threading.Timer(1.5, _enable_frameless_resize).start()
        webview.start()
    except Exception:
        # pywebview 不可用时回退到系统浏览器
        import webbrowser
        webbrowser.open(URL)
        # 保持进程存活
        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            pass


if __name__ == "__main__":
    main()
