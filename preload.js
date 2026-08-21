const { contextBridge, ipcRenderer } = require('electron');

const MENU_EVENTS = ['menu:export', 'menu:shortcuts'];

contextBridge.exposeInMainWorld('codingo', {
  appInfo: () => ipcRenderer.invoke('app:info'),
  recheckPython: () => ipcRenderer.invoke('app:recheckPython'),
  onMenu: (handler) => {
    MENU_EVENTS.forEach((channel) => {
      ipcRenderer.removeAllListeners(channel);
      ipcRenderer.on(channel, () => handler(channel));
    });
  },
  loadState: () => ipcRenderer.invoke('state:load'),
  saveState: (state) => ipcRenderer.invoke('state:save', state),
  resetState: () => ipcRenderer.invoke('state:reset'),
  pythonAvailable: () => ipcRenderer.invoke('python:available'),
  runPython: (code, stdin, timeoutMs) => ipcRenderer.invoke('python:run', { code, stdin, timeoutMs }),
  exportReport: (payload) => ipcRenderer.invoke('report:export', payload),

  gacha: {
    roster: () => ipcRenderer.invoke('gacha:roster'),
    pull: (count, pity, owned) => ipcRenderer.invoke('gacha:pull', { count, pity, owned }),
    teamPower: (entries) => ipcRenderer.invoke('gacha:teamPower', entries),
    battle: (team, owned, opponentName) => ipcRenderer.invoke('gacha:battle', { team, owned, opponentName })
  },

  arena: {
    newPool: (size) => ipcRenderer.invoke('arena:newPool', size),
    drift: (pool, days) => ipcRenderer.invoke('arena:drift', { pool, days }),
    standings: (pool, me) => ipcRenderer.invoke('arena:standings', { pool, me }),
    queue: (pool, me, waitedMs, excludeIds) => ipcRenderer.invoke('arena:queue', { pool, me, waitedMs, excludeIds }),
    tiers: () => ipcRenderer.invoke('arena:tiers'),
    season: (season) => ipcRenderer.invoke('arena:season', season),
    softReset: (me) => ipcRenderer.invoke('arena:softReset', me),
    problem: (mode, difficultyTarget, avoidIds) => ipcRenderer.invoke('arena:problem', { mode, difficultyTarget, avoidIds }),
    simOpponent: (bot, difficulty, limitSeconds) => ipcRenderer.invoke('arena:simOpponent', { bot, difficulty, limitSeconds }),
    judge: (problemId, code) => ipcRenderer.invoke('arena:judge', { problemId, code }),
    rate: (me, opponent, score) => ipcRenderer.invoke('arena:rate', { me, opponent, score })
  },
  openExternal: (url) => ipcRenderer.invoke('app:openExternal', url)
});
