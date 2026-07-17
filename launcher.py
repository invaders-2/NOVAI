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
    """获取安装目录（exe 所在目录，即 main.py 等文件所在位置）"""
    if getattr(sys, "frozen", False):
        # PyInstaller onefile：资源解压到 sys._MEIPASS
        return getattr(sys, '_MEIPASS', os.path.dirname(sys.executable))
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
    URL = f"http://127.0.0.1:{PORT}"

    # 后台线程启动 uvicorn
    import uvicorn

    server_started = threading.Event()

    def run_server():
        config = uvicorn.Config(
            main_module.app,
            host="127.0.0.1",
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
                webview.windows[0].destroy()

        def _enable_frameless_resize():
            """子类化窗口 WndProc 实现无标题栏 + resize 边框。"""
            import ctypes
            from ctypes import wintypes, WINFUNCTYPE
            user32 = ctypes.windll.user32
            kernel32 = ctypes.windll.kernel32
            pid = kernel32.GetCurrentProcessId()
            result_hwnd = None

            @WINFUNCTYPE(wintypes.BOOL, wintypes.HWND, wintypes.LPARAM)
            def enum_callback(hwnd, _lparam):
                nonlocal result_hwnd
                proc_id = wintypes.DWORD()
                user32.GetWindowThreadProcessId(hwnd, ctypes.byref(proc_id))
                if proc_id.value == pid and user32.IsWindowVisible(hwnd):
                    class_name = ctypes.create_unicode_buffer(256)
                    user32.GetClassNameW(hwnd, class_name, 256)
                    if "WindowsForms" in class_name.value:
                        result_hwnd = hwnd
                        return False
                return True

            user32.EnumWindows(enum_callback, 0)
            if not result_hwnd:
                @WINFUNCTYPE(wintypes.BOOL, wintypes.HWND, wintypes.LPARAM)
                def enum_fallback(hwnd, _lparam):
                    nonlocal result_hwnd
                    proc_id = wintypes.DWORD()
                    user32.GetWindowThreadProcessId(hwnd, ctypes.byref(proc_id))
                    if proc_id.value == pid and user32.IsWindowVisible(hwnd):
                        result_hwnd = hwnd
                        return False
                    return True
                user32.EnumWindows(enum_fallback, 0)

            if not result_hwnd:
                log("_enable_frameless_resize: no window found")
                return

            hwnd = result_hwnd
            WM_NCCALCSIZE = 0x0083
            orig_wndproc = None

            @WINFUNCTYPE(ctypes.c_longlong, wintypes.HWND, wintypes.UINT, wintypes.WPARAM, wintypes.LPARAM)
            def subclass_proc(hwnd, msg, wp, lp):
                if msg == WM_NCCALCSIZE:
                    if wp:
                        return 0
                    return ctypes.windll.user32.DefWindowProcW(hwnd, msg, wp, lp)
                return ctypes.windll.user32.CallWindowProcW(orig_wndproc, hwnd, msg, wp, lp)

            GWLP_WNDPROC = -4
            orig_wndproc = user32.SetWindowLongPtrW(hwnd, GWLP_WNDPROC,
                ctypes.cast(subclass_proc, ctypes.c_void_p).value)

            # 移除 WS_CAPTION，添加 resize 边框
            WS_CAPTION = 0x00C00000
            WS_THICKFRAME = 0x00040000
            style = user32.GetWindowLongW(hwnd, -16)
            style &= ~WS_CAPTION
            style |= WS_THICKFRAME
            user32.SetWindowLongW(hwnd, -16, style)

            # 强制重绘
            user32.SetWindowPos(hwnd, 0, 0, 0, 1400, 900, 0x0020 | 0x0002 | 0x0001)
            log("_enable_frameless_resize: subclassed + WS_CAPTION removed + 1400x900")

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
            frameless=False,
            easy_drag=False,
            js_api=api,
        )
        # 纯 Win32 移除标题栏 + 补 resize 边框
        if os.name == "nt":
            threading.Timer(1.0, _enable_frameless_resize).start()
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
