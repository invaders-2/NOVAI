/* 共享状态 + 本地持久化键。挂到全局 NV 命名空间（多 script 共享作用域）。 */
window.NV = window.NV || {};

NV.LS = {
  host: 'novai.assets.host',
  source: 'novai.assets.source',
  exportLayer: 'novai.assets.exportLayer',
};

NV.state = {
  host: '',
  connected: false,
  tab: 'assets',                 // assets | generate | settings
  source: 'assets',              // assets | canvas | local
  raw: { assets: null, canvas: null, local: null },
  aId: '',
  bId: '',
  selectedId: '',
  exportLayer: false,
  // WebSocket
  ws: null,
  wsPing: null,
  wsBackoff: 1000,
  wsWasOpen: false,
  reconnectTimer: null,
  reloadTimer: null,
};
