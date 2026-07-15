const { contextBridge } = require('electron');
contextBridge.exposeInMainWorld('novaiDesktop', {
  platform: process.platform,
  isPackaged: require('electron').app.isPackaged
});