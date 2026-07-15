const { app, BrowserWindow, dialog } = require('electron');
const { spawn } = require('child_process');
const path = require('path');
const http = require('http');

const PORT = 3000;
const APP_NAME = process.platform === 'win32' ? 'NOVAI.exe' : 'NOVAI';

// 获取可执行文件路径
function getExePath() {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, APP_NAME);
  }
  return path.join(__dirname, '..', 'dist-desktop', APP_NAME);
}

// 等待服务器就绪
function waitForServer(url, timeout = 30000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const poll = () => {
      http.get(url, (res) => {
        if (res.statusCode >= 200 && res.statusCode < 500) resolve();
        else retry();
      }).on('error', retry);
    };
    const retry = () => {
      if (Date.now() - start > timeout) reject(new Error('服务器启动超时'));
      else setTimeout(poll, 500);
    };
    poll();
  });
}

let serverProcess = null;
let mainWindow = null;

async function startServer() {
  const exePath = getExePath();
  console.log('启动服务:', exePath);
  serverProcess = spawn(exePath, [], {
    stdio: 'pipe',
    env: { ...process.env, NOVAI_PORT: String(PORT) }
  });
  serverProcess.stdout.on('data', (d) => console.log('[NOVAI]', d.toString().trim()));
  serverProcess.stderr.on('data', (d) => console.error('[NOVAI]', d.toString().trim()));
  serverProcess.on('exit', (code) => {
    console.log('服务退出:', code);
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('server-status', { running: false, code });
    }
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    title: 'NOVAI 智能画布',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });
  mainWindow.loadURL(`http://localhost:${PORT}`);
  mainWindow.on('closed', () => { mainWindow = null; });
  // 移除菜单栏
  mainWindow.setMenuBarVisibility(false);
}

app.on('ready', async () => {
  try {
    await startServer();
    await waitForServer(`http://localhost:${PORT}/`);
    createWindow();
  } catch (e) {
    dialog.showErrorBox('启动失败', e.message);
    app.quit();
  }
});

app.on('window-all-closed', () => {
  if (serverProcess) {
    serverProcess.kill();
    serverProcess = null;
  }
  if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', () => {
  if (serverProcess) {
    serverProcess.kill();
    serverProcess = null;
  }
});
