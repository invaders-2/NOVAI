const { app, BrowserWindow, dialog, shell } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');

// Determine paths
const isDev = !app.isPackaged;
const isWin = process.platform === 'win32';

let backendDir;
if (isDev) {
  backendDir = path.join(__dirname, '..');
} else {
  backendDir = path.join(process.resourcesPath, 'backend');
}

const PORT = 3000;
const BASE_URL = `http://localhost:${PORT}`;

let pythonProcess = null;
let mainWindow = null;

function findPython() {
  const candidates = isWin ? ['python', 'python3', 'py'] : ['python3', 'python'];
  const { execSync } = require('child_process');
  for (const cmd of candidates) {
    try {
      execSync(`${cmd} --version`, { stdio: 'ignore' });
      return cmd;
    } catch (e) { /* continue */ }
  }
  return null;
}

function checkPythonVersion(pythonCmd) {
  const { execSync } = require('child_process');
  try {
    const output = execSync(`${pythonCmd} --version`, { encoding: 'utf-8' });
    const match = output.match(/Python\s+(\d+)\.(\d+)/);
    if (match) {
      const major = parseInt(match[1], 10);
      const minor = parseInt(match[2], 10);
      return major > 3 || (major === 3 && minor >= 10);
    }
    return false;
  } catch (e) {
    return false;
  }
}

function checkAndInstallDeps() {
  return new Promise((resolve) => {
    const markerPath = path.join(backendDir, '.deps_installed');

    // Already installed, skip
    if (fs.existsSync(markerPath)) {
      console.log('[NOVAI] 依赖标记文件已存在，跳过安装。');
      resolve();
      return;
    }

    const pythonCmd = findPython();
    if (!pythonCmd) {
      dialog.showErrorBox('环境错误', '未找到 Python。请安装 Python 3.10+ 后重试。');
      app.quit();
      return;
    }

    if (!checkPythonVersion(pythonCmd)) {
      dialog.showErrorBox('Python 版本过低', '需要 Python 3.10 或更高版本，请升级后重试。');
      app.quit();
      return;
    }

    console.log('[NOVAI] 正在安装 Python 依赖，请稍候...');
    console.log(`[NOVAI] pip install -r requirements.txt (目录: ${backendDir})`);

    const { execSync } = require('child_process');
    try {
      execSync(`${pythonCmd} -m pip install -r requirements.txt`, {
        cwd: backendDir,
        stdio: 'inherit',
        encoding: 'utf-8',
      });
      // Mark as installed
      fs.writeFileSync(markerPath, new Date().toISOString());
      console.log('[NOVAI] 依赖安装完成。');
      resolve();
    } catch (err) {
      const msg = err.stderr || err.message || String(err);
      dialog.showErrorBox('依赖安装失败', `pip install 执行失败:\n${msg}`);
      app.quit();
    }
  });
}

function startBackend() {
  return new Promise((resolve, reject) => {
    const pythonCmd = findPython();
    if (!pythonCmd) {
      reject(new Error('未找到 Python。请安装 Python 3.10+ 后重试。'));
      return;
    }

    const env = { ...process.env, DEPLOY_RUN_PORT: String(PORT) };
    pythonProcess = spawn(pythonCmd, ['main.py'], {
      cwd: backendDir,
      env,
      stdio: ['ignore', 'pipe', 'pipe'],
      windowsHide: true,
    });

    let started = false;
    const timeout = setTimeout(() => {
      if (!started) reject(new Error('后端启动超时（30秒）'));
    }, 30000);

    pythonProcess.stdout.on('data', (data) => {
      const text = data.toString();
      if (!started && (text.includes('Uvicorn running') || text.includes('Application startup complete'))) {
        started = true;
        clearTimeout(timeout);
        // Give it a moment, then resolve
        setTimeout(resolve, 500);
      }
    });

    pythonProcess.stderr.on('data', (data) => {
      // Uvicorn logs to stderr
      const text = data.toString();
      if (!started && (text.includes('Uvicorn running') || text.includes('Application startup complete'))) {
        started = true;
        clearTimeout(timeout);
        setTimeout(resolve, 500);
      }
    });

    pythonProcess.on('error', (err) => {
      clearTimeout(timeout);
      reject(new Error(`无法启动 Python: ${err.message}`));
    });

    pythonProcess.on('exit', (code) => {
      clearTimeout(timeout);
      if (!started) {
        reject(new Error(`Python 进程异常退出 (code: ${code})`));
      }
    });
  });
}

function waitForServer(retries = 30) {
  return new Promise((resolve, reject) => {
    function check() {
      http.get(BASE_URL, (res) => {
        resolve();
      }).on('error', () => {
        retries--;
        if (retries <= 0) {
          reject(new Error('服务器启动后无法连接'));
          return;
        }
        setTimeout(check, 1000);
      });
    }
    check();
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 900,
    minHeight: 600,
    title: 'NOVAI',
    icon: path.join(backendDir, 'static', 'images', 'logo.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    show: false,
    titleBarStyle: isWin ? 'default' : 'hiddenInset',
    trafficLightPosition: isWin ? undefined : { x: 16, y: 16 },
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.loadURL(BASE_URL);

  // Open external links in default browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function killBackend() {
  if (pythonProcess) {
    pythonProcess.kill('SIGTERM');
    setTimeout(() => {
      try { pythonProcess.kill('SIGKILL'); } catch (e) { /* ignore */ }
    }, 3000);
    pythonProcess = null;
  }
}

app.whenReady().then(async () => {
  try {
    await checkAndInstallDeps();
    await startBackend();
    await waitForServer();
    createWindow();
  } catch (err) {
    dialog.showErrorBox('启动失败', err.message);
    app.quit();
  }
});

app.on('window-all-closed', () => {
  killBackend();
  app.quit();
});

app.on('before-quit', () => {
  killBackend();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
