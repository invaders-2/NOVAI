const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('novaiDesktop', {
  platform: process.platform,
  isElectron: true,
});
