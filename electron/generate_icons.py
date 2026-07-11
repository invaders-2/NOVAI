#!/usr/bin/env python3
"""Generate macOS .icns and Windows .ico from logo.png"""
import os
import sys
import subprocess
from pathlib import Path

SCRIPT_DIR = Path(__file__).parent
LOGO = SCRIPT_DIR.parent / 'static' / 'images' / 'logo.png'

def check_deps():
    """Check required tools."""
    # For .icns we need sips (built into macOS) or imagemagick
    # For .ico we need imagemagick or pillow
    try:
        from PIL import Image
        return 'pillow'
    except ImportError:
        pass
    return None

def gen_icons_pillow():
    from PIL import Image
    img = Image.open(LOGO)
    if img.mode != 'RGBA':
        img = img.convert('RGBA')

    # Generate .ico (Windows) - multi-resolution
    sizes = [16, 32, 48, 64, 128, 256]
    img.save(SCRIPT_DIR / 'icon.ico', format='ICO', sizes=[(s, s) for s in sizes])

    # Generate .icns (macOS) via PNG iconset + iconutil
    iconset = SCRIPT_DIR / 'icon.iconset'
    iconset.mkdir(exist_ok=True)
    mac_sizes = [16, 32, 64, 128, 256, 512]
    for s in mac_sizes:
        resized = img.resize((s, s), Image.LANCZOS)
        resized.save(iconset / f'icon_{s}x{s}.png')
        # @2x retina versions
        s2 = s * 2
        if s2 <= 1024:
            resized2 = img.resize((s2, s2), Image.LANCZOS)
            resized2.save(iconset / f'icon_{s}x{s}@2x.png')

    subprocess.run(['iconutil', '-c', 'icns', str(iconset), '-o', str(SCRIPT_DIR / 'icon.icns')],
                   check=True)
    # Cleanup iconset
    import shutil
    shutil.rmtree(iconset)

    print(f'Generated: icon.icns, icon.ico')

def gen_icons_sips():
    """macOS fallback using sips."""
    iconset = SCRIPT_DIR / 'icon.iconset'
    iconset.mkdir(exist_ok=True)

    sizes = [16, 32, 64, 128, 256, 512]
    for s in sizes:
        out = iconset / f'icon_{s}x{s}.png'
        subprocess.run(['sips', '-z', str(s), str(s), str(LOGO), '--out', str(out)], check=True)
        s2 = s * 2
        if s2 <= 1024:
            out2 = iconset / f'icon_{s}x{s}@2x.png'
            subprocess.run(['sips', '-z', str(s2), str(s2), str(LOGO), '--out', str(out2)], check=True)

    subprocess.run(['iconutil', '-c', 'icns', str(iconset), '-o', str(SCRIPT_DIR / 'icon.icns')],
                   check=True)
    import shutil
    shutil.rmtree(iconset)

    # For .ico, use a simple 256x256 PNG as fallback (electron-builder on mac can use PNG as icon)
    subprocess.run(['sips', '-z', '256', '256', str(LOGO), '--out', str(SCRIPT_DIR / 'icon.ico')],
                   check=True)
    print(f'Generated: icon.icns, icon.ico (PNG fallback for Windows)')

if __name__ == '__main__':
    dep = check_deps()
    if dep == 'pillow':
        print('Using Pillow to generate icons...')
        gen_icons_pillow()
    elif sys.platform == 'darwin':
        print('Using sips (macOS built-in) to generate icons...')
        gen_icons_sips()
    else:
        print('ERROR: Need Pillow (pip install Pillow) or be on macOS to generate icons.')
        sys.exit(1)
