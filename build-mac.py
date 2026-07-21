#!/usr/bin/env python3
"""NOVAI Mac 桌面版一键构建脚本

在 macOS 上运行： python3 build-mac.py

流程：
1. 安装依赖（pyinstaller, pywebview, pyobjc）
2. PyInstaller --windowed --onedir 生成 NOVAI.app
3. 复制外置业务文件（main.py, static/, tools/ 等）到 .app/Contents/MacOS/
4. 修正 Info.plist（版本号、Bundle ID、最小系统版本）
5. hdiutil 生成 .dmg 安装包

设计要点：
- 用 onedir 而非 onefile：launcher.py 的 get_app_dir() 在 onedir 下返回
  os.path.dirname(sys.executable) = .app/Contents/MacOS/，外置 main.py
  放这里，在线更新只替换业务代码，不重新打包 .app
- 外置文件 = 可更新文件；内置进二进制的 = 不轻易变的依赖
"""

import os
import sys
import shutil
import subprocess
import platform

ROOT = os.path.dirname(os.path.abspath(__file__))
DIST = os.path.join(ROOT, "dist-desktop")
APP_NAME = "NOVAI"
APP_DISPLAY = "NOVAI 智能画布"
BUNDLE_ID = "com.novai.desktop"


def run(cmd, cwd=None):
    cwd = cwd or ROOT
    print(f"  $ {cmd}")
    subprocess.run(cmd, shell=True, cwd=cwd, check=True)


def read_version():
    vf = os.path.join(ROOT, "VERSION")
    if os.path.isfile(vf):
        try:
            with open(vf, encoding="utf-8") as f:
                return f.read().strip().splitlines()[0].strip()
        except Exception:
            pass
    return "1.0.0"


def install_deps():
    """安装 Mac 打包依赖"""
    print("=== 安装依赖 ===")
    subprocess.run(
        [sys.executable, "-m", "pip", "install",
         "pyinstaller", "pywebview", "pyobjc"],
        check=True, capture_output=False,
    )


def clean():
    print("=== 清理旧产物 ===")
    for d in ["build", "dist"]:
        p = os.path.join(ROOT, d)
        if os.path.isdir(p):
            shutil.rmtree(p, ignore_errors=True)
            print(f"  已删除 {d}")
    for f in os.listdir(ROOT):
        if f.endswith(".spec") and f != "NOVAI.spec":
            os.remove(os.path.join(ROOT, f))
            print(f"  已删除 {f}")


def build_app():
    """PyInstaller 打包 launcher.py -> NOVAI.app（onedir, windowed）"""
    print("=== PyInstaller 打包 ===")
    launcher = os.path.join(ROOT, "launcher.py")

    hidden = [
        "uvicorn.logging", "uvicorn.loops.auto", "uvicorn.protocols.http.auto",
        "uvicorn.protocols.websockets.auto", "websockets",
        "fastapi", "aiofiles", "pydantic", "python_multipart", "httpx", "PIL",
        "webview", "webview.platforms.cocoa",
        "requests", "qrcode", "pystray", "pystray._darwin",
    ]

    cmd_parts = [
        "pyinstaller",
        "--windowed",       # 生成 .app bundle，无终端窗口
        "--onedir",         # 目录模式，外置 main.py 可放 .app/Contents/MacOS/
        "--noconfirm",
        f"--name={APP_NAME}",
        f'--icon={os.path.join(ROOT, "static", "images", "icon.icns")}'
        if os.path.exists(os.path.join(ROOT, "static", "images", "icon.icns"))
        else "",
    ]
    cmd_parts = [c for c in cmd_parts if c]
    for h in hidden:
        cmd_parts.append(f"--hidden-import={h}")
    cmd_parts.append(f'"{launcher}"')

    run(" ".join(cmd_parts))

    app_path = os.path.join(ROOT, "dist", f"{APP_NAME}.app")
    if not os.path.isdir(app_path):
        print("❌ PyInstaller 打包失败，未找到 dist/NOVAI.app")
        sys.exit(1)
    print(f"✅ {app_path}")
    return app_path


def copy_business_files(app_path):
    """复制外置业务文件到 .app/Contents/MacOS/（launcher.py 的 get_app_dir 指向这里）"""
    print("=== 复制业务文件 ===")
    macos_dir = os.path.join(app_path, "Contents", "MacOS")

    # 可更新的单个文件
    for f in ["main.py", "app.py", "VERSION", "requirements.txt"]:
        src = os.path.join(ROOT, f)
        if os.path.isfile(src):
            shutil.copy2(src, os.path.join(macos_dir, f))

    # 目录
    for folder in ["static", "tools", "packages"]:
        src = os.path.join(ROOT, folder)
        dst = os.path.join(macos_dir, folder)
        if os.path.isdir(dst):
            shutil.rmtree(dst, ignore_errors=True)
        if os.path.isdir(src):
            shutil.copytree(src, dst,
                            ignore=shutil.ignore_patterns("*.pyc", "__pycache__"))

    # assets（不复制 input/output/uploads，运行时创建）
    dst_assets = os.path.join(macos_dir, "assets")
    os.makedirs(dst_assets, exist_ok=True)
    src_assets = os.path.join(ROOT, "assets")
    if os.path.isdir(src_assets):
        for item in os.listdir(src_assets):
            if item in ("input", "output", "uploads"):
                continue
            s = os.path.join(src_assets, item)
            d = os.path.join(dst_assets, item)
            if os.path.isfile(s):
                shutil.copy2(s, d)
            elif os.path.isdir(s):
                if os.path.isdir(d):
                    shutil.rmtree(d, ignore_errors=True)
                shutil.copytree(s, d,
                                ignore=shutil.ignore_patterns("*.pyc", "__pycache__"))

    # 即梦 CLI 脚本
    for f in ["安装即梦CLI.command", "登录即梦CLI.command"]:
        src = os.path.join(ROOT, f)
        if os.path.isfile(src):
            shutil.copy2(src, os.path.join(macos_dir, f))
            os.chmod(os.path.join(macos_dir, f), 0o755)

    print(f"✅ 业务文件已复制到 {macos_dir}")


def fix_info_plist(app_path, version):
    """修正 Info.plist：版本号、Bundle ID、最小系统版本、高分辨率支持"""
    print("=== 修正 Info.plist ===")
    plist_path = os.path.join(app_path, "Contents", "Info.plist")

    # 用 defaults write 或直接生成 plist
    # PyInstaller 已生成基础 Info.plist，这里补关键字段
    import plistlib
    try:
        with open(plist_path, "rb") as f:
            plist = plistlib.load(f)
    except Exception:
        plist = {}

    plist["CFBundleName"] = APP_DISPLAY
    plist["CFBundleDisplayName"] = APP_DISPLAY
    plist["CFBundleIdentifier"] = BUNDLE_ID
    plist["CFBundleShortVersionString"] = version
    plist["CFBundleVersion"] = version
    plist["LSMinimumSystemVersion"] = "10.13"
    plist["NSHighResolutionCapable"] = True
    plist["NSSupportsAutomaticGraphicsSwitching"] = True
    plist["LSUIElement"] = False  # 显示在 Dock
    plist["NSAppTransportSecurity"] = {
        "NSAllowsArbitraryLoads": True,  # 允许 http://127.0.0.1 本地
    }

    with open(plist_path, "wb") as f:
        plistlib.dump(plist, f)

    print(f"✅ Info.plist: version={version}, bundle={BUNDLE_ID}")


def build_dmg(app_path, version):
    """用 hdiutil 生成 .dmg 安装包"""
    print("=== 生成 DMG ===")
    os.makedirs(DIST, exist_ok=True)
    dmg_path = os.path.join(DIST, f"NOVAI-Setup-{version}.dmg")

    # 先删旧 dmg
    if os.path.exists(dmg_path):
        os.remove(dmg_path)

    # 准备临时 dmg 目录，放 .app + Applications 软链接（拖拽安装）
    dmg_staging = os.path.join(ROOT, "dist", "dmg-staging")
    if os.path.isdir(dmg_staging):
        shutil.rmtree(dmg_staging, ignore_errors=True)
    os.makedirs(dmg_staging)

    # 复制 .app 到 staging
    staging_app = os.path.join(dmg_staging, f"{APP_NAME}.app")
    shutil.copytree(app_path, staging_app, symlinks=True)

    # Applications 软链接（用户拖 .app 到 Applications）
    apps_link = os.path.join(dmg_staging, "Applications")
    if os.path.exists(apps_link):
        os.remove(apps_link)
    os.symlink("/Applications", apps_link)

    # hdiutil create
    cmd = (
        f'hdiutil create -volname "{APP_DISPLAY}" '
        f'-srcfolder "{dmg_staging}" '
        f'-ov -format UDZO "{dmg_path}"'
    )
    run(cmd)

    # 清理 staging
    shutil.rmtree(dmg_staging, ignore_errors=True)

    if os.path.exists(dmg_path):
        print(f"✅ DMG: {dmg_path}")
    else:
        print("❌ DMG 生成失败")
        sys.exit(1)


def main():
    if platform.system() != "Darwin":
        print("❌ 此脚本需要在 macOS 上运行")
        print("   请在 Mac 上执行: python3 build-mac.py")
        sys.exit(1)

    version = read_version()
    os.chdir(ROOT)

    print(f"=== NOVAI Mac 桌面版构建 ===")
    print(f"版本: {version}")
    print(f"目录: {ROOT}")
    print()

    try:
        install_deps()
        clean()
        app_path = build_app()
        copy_business_files(app_path)
        fix_info_plist(app_path, version)
        build_dmg(app_path, version)

        # 也复制一份 .app 到 dist-desktop（方便直接测试）
        shutil.copytree(app_path, os.path.join(DIST, f"{APP_NAME}.app"),
                        symlinks=True, dirs_exist_ok=True)

        print()
        print("=" * 50)
        print("✅ 构建完成！")
        print(f"   .app: {os.path.join(DIST, APP_NAME + '.app')}")
        print(f"   .dmg: {os.path.join(DIST, f'NOVAI-Setup-{version}.dmg')}")
        print("=" * 50)
        print()
        print("提示：")
        print("  - 未签名版本首次打开需右键 -> 打开，或在系统设置 -> 隐私与安全中允许")
        print("  - 如需签名: codesign --deep --force --sign \"Developer ID Application: XXX\" NOVAI.app")
        print("  - 如需公证: xcrun notarytool submit NOVAI.dmg --keychain-profile XXX --wait")
    except subprocess.CalledProcessError as e:
        print(f"\n❌ 构建失败: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
