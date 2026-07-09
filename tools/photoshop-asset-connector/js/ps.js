/* Photoshop 侧操作：下载到临时文件、置入文档、导出当前文档为 PNG、外部打开。 */
(function () {
  const photoshop = require('photoshop');
  const app = photoshop.app;
  const core = photoshop.core;
  const action = photoshop.action;
  const uxp = require('uxp');
  const fs = uxp.storage.localFileSystem;
  const formats = uxp.storage.formats;
  const shell = uxp.shell;

  const net = DX.net;
  const itemIsImage = DX.sources.itemIsImage;

  function hasDocument() { return app.documents.length > 0; }

  // 当前文档像素尺寸（用于"适配当前尺寸"），无文档返回 null
  function docSize() {
    const d = app.activeDocument;
    if (!d) return null;
    try { return { w: Math.round(d.width), h: Math.round(d.height) }; }
    catch (e) { return null; }
  }

  async function downloadToTemp(item) {
    // WebP 等 PS 可能打不开的格式：取后端转好的整张 JPEG；其余直接取原图
    const unsupported = net.needsJpeg(item.url);
    const buffer = await net.fetchBytes(unsupported ? net.displayUrl(item.url, 0) : item.url);
    let ext = unsupported ? 'jpg' : (String(item.url || '').split(/[?#]/)[0].split('.').pop() || 'png').toLowerCase();
    if (!/^[a-z0-9]{1,5}$/.test(ext)) ext = 'png';
    const safe = String(item.name || 'asset').replace(/[\\/:*?"<>|]+/g, '_').slice(0, 48) || 'asset';
    const folder = await fs.getTemporaryFolder();
    const file = await folder.createFile(`dx_${safe}_${Date.now()}.${ext}`, { overwrite: true });
    await file.write(buffer, { format: formats.binary });
    return file;
  }

  // 资产 → PS：置入为智能对象（无文档时直接打开）
  async function placeImage(item) {
    if (!itemIsImage(item)) throw new Error('该素材不是图片');
    const file = await downloadToTemp(item);
    const token = await fs.createSessionToken(file);
    await core.executeAsModal(async () => {
      if (!app.documents.length) { await app.open(file); return; }
      await action.batchPlay([{
        _obj: 'placeEvent',
        null: { _path: token, _kind: 'local' },
        freeTransformCenterState: { _enum: 'quadCenterState', _value: 'QCSAverage' },
        offset: {
          _obj: 'offset',
          horizontal: { _unit: 'pixelsUnit', _value: 0 },
          vertical: { _unit: 'pixelsUnit', _value: 0 },
        },
      }], {});
    }, { commandName: '置入素材' });
  }

  // PS → 后端：导出当前文档为合并 PNG（asCopy=true，不改动用户文档），返回字节
  async function exportDocPng() {
    const folder = await fs.getTemporaryFolder();
    const file = await folder.createFile(`dx_export_${Date.now()}.png`, { overwrite: true });
    let docName = 'document';
    await core.executeAsModal(async () => {
      const doc = app.activeDocument;
      docName = (doc && doc.name) || 'document';
      await doc.saveAs.png(file, {}, true);
    }, { commandName: '导出文档' });
    const buffer = await file.read({ format: formats.binary });
    return { buffer, name: String(docName).replace(/\.[^.]+$/, '') || 'PS文档' };
  }

  // PS → 后端：只导出「当前激活图层」为 PNG。
  // 做法：用当前图层新建一个临时文档（= 图层 > 复制图层 > 目标:新建文档），存 PNG，再关掉临时文档；
  // 全程不改动用户的原文档。
  async function exportActiveLayerPng() {
    const folder = await fs.getTemporaryFolder();
    const file = await folder.createFile(`dx_layer_${Date.now()}.png`, { overwrite: true });
    let layerName = 'layer';
    await core.executeAsModal(async () => {
      const srcDoc = app.activeDocument;
      if (!srcDoc) throw new Error('没有打开的文档');
      const srcId = srcDoc.id;
      const layers = srcDoc.activeLayers || [];
      if (!layers.length) throw new Error('请先在图层面板选中要上传的图层');
      layerName = layers[0].name || 'layer';
      // 把当前选中图层复制成一个新文档
      await action.batchPlay([{
        _obj: 'make',
        _target: [{ _ref: 'document' }],
        name: 'dx_tmp_layer_export',
        using: {
          _ref: [
            { _ref: 'layer', _enum: 'ordinal', _value: 'targetEnum' },
            { _ref: 'document', _enum: 'ordinal', _value: 'targetEnum' },
          ],
        },
      }], { synchronousExecution: true });
      const tmpDoc = app.activeDocument;
      // 安全护栏：确认确实新建了文档，否则绝不关闭（避免误关用户原文档）
      if (!tmpDoc || tmpDoc.id === srcId) throw new Error('未能从图层创建临时文档');
      await tmpDoc.saveAs.png(file, {}, true);
      await tmpDoc.closeWithoutSaving();
    }, { commandName: '导出当前图层' });
    const buffer = await file.read({ format: formats.binary });
    return { buffer, name: String(layerName).replace(/\.[^.]+$/, '') || 'layer' };
  }

  async function exportCurrentPng() {
    return DX.state.exportLayer ? exportActiveLayerPng() : exportDocPng();
  }

  async function openExternal(item) { await shell.openExternal(net.absUrl(item.url)); }

  async function openUrl(url) { await shell.openExternal(url); }

  // 文档开关/切换时回调（用于刷新导出按钮可用性）
  function onDocChange(cb) {
    try { action.addNotificationListener(['open', 'close', 'select', 'newDocument'], cb); }
    catch (e) { /* 部分版本不支持 */ }
  }

  DX.ps = { hasDocument, docSize, placeImage, exportDocPng, exportActiveLayerPng, exportCurrentPng, openExternal, openUrl, onDocChange };
})();
