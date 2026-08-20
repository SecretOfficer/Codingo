const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('codingo', {
  loadState: () => ipcRenderer.invoke('state:load'),
  saveState: (state) => ipcRenderer.invoke('state:save', state),
  resetState: () => ipcRenderer.invoke('state:reset'),
  pythonAvailable: () => ipcRenderer.invoke('python:available'),
  runPython: (code, stdin, timeoutMs) => ipcRenderer.invoke('python:run', { code, stdin, timeoutMs }),
  exportReport: (payload) => ipcRenderer.invoke('report:export', payload),

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
