#!/bin/bash
# NOVAI Desktop Builder
# Builds macOS .app and .dmg, or Windows .exe installer
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo "=== NOVAI Desktop Builder ==="

# Check Node.js
if ! command -v node &>/dev/null; then
    echo "ERROR: Node.js is required. Install from https://nodejs.org"
    exit 1
fi

# Install Electron dependencies
cd "$SCRIPT_DIR"
if [ ! -d "node_modules" ]; then
    echo "Installing Electron dependencies..."
    npm install
fi

# Generate icons if missing
if [ ! -f "icon.icns" ] || [ ! -f "icon.ico" ]; then
    echo "Generating app icons..."
    python3 generate_icons.py
fi

PLATFORM="${1:-mac}"

case "$PLATFORM" in
    mac|macos)
        echo "Building for macOS..."
        npm run build:mac
        echo ""
        echo "Done! Output in: $PROJECT_DIR/dist-desktop/"
        ls -lh "$PROJECT_DIR/dist-desktop/"*.dmg "$PROJECT_DIR/dist-desktop/"*.zip 2>/dev/null || true
        ;;
    win|windows)
        echo "Building for Windows..."
        npm run build:win
        echo ""
        echo "Done! Output in: $PROJECT_DIR/dist-desktop/"
        ls -lh "$PROJECT_DIR/dist-desktop/"*.exe 2>/dev/null || true
        ;;
    all)
        echo "Building for macOS + Windows..."
        npm run build:all
        echo ""
        echo "Done! Output in: $PROJECT_DIR/dist-desktop/"
        ls -lh "$PROJECT_DIR/dist-desktop/" 2>/dev/null || true
        ;;
    *)
        echo "Usage: $0 [mac|win|all]"
        exit 1
        ;;
esac
