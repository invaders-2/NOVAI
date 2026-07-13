const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

const OUTPUT_DIR = path.join(__dirname, '..', 'static', 'images');
const ICON_SIZE = 1024;
const LOGO_RATIO = 0.70;
const LOGO_SIZE = Math.round(ICON_SIZE * LOGO_RATIO);
const OFFSET = Math.round((ICON_SIZE - LOGO_SIZE) / 2);
const CORNER_RADIUS = Math.round(ICON_SIZE * 0.20);

// Simplified pure-black Z-shape logo (outer contour only, no internal cuts)
const Z_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
  <rect width="1024" height="1024" fill="white"/>
  <path fill="#000000" d="
    M 870 170
    L 154 170
    L 154 330
    L 640 330
    L 154 694
    L 154 854
    L 870 854
    L 870 694
    L 384 694
    L 870 330
    Z
  "/>
</svg>`;

async function main() {
    // Step 1: Render Z logo at logo size on white bg
    const logoBuf = await sharp(Buffer.from(Z_SVG))
        .resize(LOGO_SIZE, LOGO_SIZE)
        .png()
        .toBuffer();

    // Step 2: Create final icon canvas (white, rounded corners)
    const canvasSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${ICON_SIZE}" height="${ICON_SIZE}">
        <rect width="${ICON_SIZE}" height="${ICON_SIZE}" rx="${CORNER_RADIUS}" ry="${CORNER_RADIUS}" fill="white"/>
    </svg>`;

    const canvas = await sharp(Buffer.from(canvasSvg))
        .png()
        .toBuffer();

    // Step 3: Composite logo onto canvas
    const finalPng = await sharp(canvas)
        .composite([{ input: logoBuf, left: OFFSET, top: OFFSET }])
        .png()
        .toFile(path.join(OUTPUT_DIR, 'logo.png'));

    console.log('Generated: logo.png');

    const pngPath = path.join(OUTPUT_DIR, 'logo.png');

    // Step 4: Generate icon.icns
    const iconsetDir = path.join(OUTPUT_DIR, 'icon.iconset');
    if (fs.existsSync(iconsetDir)) fs.rmSync(iconsetDir, { recursive: true, force: true });
    fs.mkdirSync(iconsetDir);

    const sizes = [16, 32, 64, 128, 256, 512, 1024];
    for (const s of sizes) {
        await sharp(pngPath).resize(s, s).png().toFile(path.join(iconsetDir, `icon_${s}x${s}.png`));
        if (s <= 512) {
            await sharp(pngPath).resize(s * 2, s * 2).png().toFile(path.join(iconsetDir, `icon_${s}x${s}@2x.png`));
        }
    }

    const icnsPath = path.join(OUTPUT_DIR, 'icon.icns');
    execSync(`iconutil -c icns "${iconsetDir}" -o "${icnsPath}"`, { stdio: 'inherit' });
    fs.rmSync(iconsetDir, { recursive: true, force: true });
    console.log('Generated: icon.icns');

    // Step 5: Generate icon.ico
    const icoPath = path.join(OUTPUT_DIR, 'icon.ico');
    const ico256 = await sharp(pngPath).resize(256, 256).png().toBuffer();

    const header = Buffer.alloc(6);
    header.writeUInt16LE(0, 0);
    header.writeUInt16LE(1, 2);
    header.writeUInt16LE(1, 4);

    const dirEntry = Buffer.alloc(16);
    dirEntry.writeUInt8(0, 0);
    dirEntry.writeUInt8(0, 1);
    dirEntry.writeUInt8(0, 2);
    dirEntry.writeUInt8(0, 3);
    dirEntry.writeUInt16LE(1, 4);
    dirEntry.writeUInt16LE(32, 6);
    dirEntry.writeUInt32LE(ico256.length, 8);
    dirEntry.writeUInt32LE(22, 12);

    fs.writeFileSync(icoPath, Buffer.concat([header, dirEntry, ico256]));
    console.log('Generated: icon.ico');

    // Step 6: Copy to electron/
    const electronPng = path.join(__dirname, 'icon.png');
    fs.copyFileSync(pngPath, electronPng);
    fs.copyFileSync(icnsPath, path.join(__dirname, 'icon.icns'));
    fs.copyFileSync(icoPath, path.join(__dirname, 'icon.ico'));
    console.log('Copied to electron/');
}

main().catch(err => { console.error(err); process.exit(1); });
