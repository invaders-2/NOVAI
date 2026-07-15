#!/usr/bin/env python3
"""NOVAI 安装程序 — 独立安装包"""
import os, sys, shutil, pythoncom
from win32com.client import Dispatch

APP_NAME = "NOVAI 智能画布"
INSTALL_DIR = os.path.join(os.environ.get("ProgramFiles", "C:\\Program Files"), "NOVAI")

def create_shortcut(target, shortcut_path, description="", working_dir=""):
    shell = Dispatch('WScript.Shell')
    shortcut = shell.CreateShortCut(shortcut_path)
    shortcut.TargetPath = target
    shortcut.WorkingDirectory = working_dir or os.path.dirname(target)
    shortcut.Description = description
    shortcut.IconLocation = target
    shortcut.Save()

def install():
    print(f"安装 {APP_NAME} 到 {INSTALL_DIR}")
    
    # 创建安装目录
    os.makedirs(INSTALL_DIR, exist_ok=True)
    
    # 复制文件
    src_dir = os.path.dirname(os.path.abspath(__file__))
    for item in os.listdir(src_dir):
        if item in ('installer.exe', '__pycache__', 'build', 'dist'):
            continue
        src = os.path.join(src_dir, item)
        dst = os.path.join(INSTALL_DIR, item)
        if os.path.isfile(src):
            shutil.copy2(src, dst)
        elif os.path.isdir(src) and item not in ('data', 'output', 'assets'):
            if os.path.exists(dst):
                shutil.rmtree(dst)
            shutil.copytree(src, dst)
    
    # 创建数据目录
    for d in ['data', 'output', 'assets/output']:
        os.makedirs(os.path.join(INSTALL_DIR, d), exist_ok=True)
    
    # 桌面快捷方式
    desktop = os.path.join(os.environ["USERPROFILE"], "Desktop")
    bat_path = os.path.join(INSTALL_DIR, "NOVAI-桌面版.bat")
    create_shortcut(bat_path, os.path.join(desktop, f"{APP_NAME}.lnk"),
                    f"{APP_NAME} 桌面版启动器", INSTALL_DIR)
    
    # 开始菜单
    start_menu = os.path.join(os.environ["APPDATA"], "Microsoft", "Windows", "Start Menu", "Programs")
    novai_menu = os.path.join(start_menu, APP_NAME)
    os.makedirs(novai_menu, exist_ok=True)
    create_shortcut(bat_path, os.path.join(novai_menu, f"{APP_NAME}.lnk"),
                    f"{APP_NAME} 桌面版", INSTALL_DIR)
    
    # 卸载脚本
    uninstall = os.path.join(INSTALL_DIR, "卸载.bat")
    with open(uninstall, 'w', encoding='utf-8') as f:
        f.write(f'''@echo off
chcp 65001 >nul
echo 正在卸载 {APP_NAME}...
taskkill /F /IM NOVAI.exe 2>nul
timeout /t 2 /nobreak >nul
rmdir /s /q "{INSTALL_DIR}"
del "%USERPROFILE%\\Desktop\\{APP_NAME}.lnk" 2>nul
rmdir /s /q "%APPDATA%\\Microsoft\\Windows\\Start Menu\\Programs\\{APP_NAME}" 2>nul
echo 卸载完成！
pause
''')
    
    print(f"✅ 安装完成！")
    print(f"   安装位置: {INSTALL_DIR}")
    print(f"   桌面快捷方式已创建")
    
    # 询问是否启动
    try:
        os.startfile(bat_path)
    except:
        pass

if __name__ == '__main__':
    install()
    input("按回车退出...")
