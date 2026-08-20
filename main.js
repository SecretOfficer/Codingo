const { app, BrowserWindow, ipcMain, shell, dialog, Menu } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { spawn, spawnSync } = require('child_process');

const isDev = process.argv.includes('--dev');

let mainWindow = null;

/* ---------------------------------------------------------------- storage */

function progressFile() {
  return path.join(app.getPath('userData'), 'progress.json');
}

const DEFAULT_STATE = {
  version: 2,
  xp: 0,
  gems: 200,
  hearts: 5,
  maxHearts: 5,
  heartsRefillAt: null,
  streak: 0,
  lastActiveDay: null,
  dailyGoal: 50,
  xpToday: 0,
  lessons: {},        // lessonId  -> { crowns, completions, bestAccuracy }
  topics: {},         // lessonId  -> { seen, correct }   drives the weak-topic list
  subjectStats: {},   // subjectId -> { xp, correct, wrong, seconds, lessons }
  history: {},        // YYYY-MM-DD -> { xp, correct, wrong, seconds, lessons, labs }
  labs: {},           // labId     -> { done: [challengeId], runs, seconds }
  settings: { fontScale: 1, contrast: false, motion: true },
  arena: {
    player: { id: 'me', name: 'You', rating: 1500, rd: 350, vol: 0.06, wins: 0, losses: 0, draws: 0, streak: 0, best: 1500 },
    pool: [],
    placements: 0,      // placement duels played, 5 before a rank is shown
    placed: false,
    season: { number: 1, startedAt: null },
    duels: [],          // most recent duels, newest first
    solvedProblems: [],
    lastDrift: null
  },
  seenIntro: false
};

function backupFile() {
  return progressFile() + '.bak';
}

function readJson(file) {
  const raw = fs.readFileSync(file, 'utf8');
  const parsed = JSON.parse(raw);
  if (!parsed || typeof parsed !== 'object') throw new Error('not an object');
  return parsed;
}

/** Load progress, falling back to the last good backup if the main file is damaged. */
function loadState() {
  try {
    return Object.assign({}, DEFAULT_STATE, readJson(progressFile()));
  } catch (err) {
    if (err.code !== 'ENOENT') console.error('progress unreadable, trying backup:', err.message);
    try {
      const recovered = Object.assign({}, DEFAULT_STATE, readJson(backupFile()));
      console.warn('recovered progress from backup');
      return recovered;
    } catch (err2) {
      return Object.assign({}, DEFAULT_STATE);
    }
  }
}

/**
 * Write progress atomically: a half-written file after a crash or power cut would
 * otherwise wipe a learner's history. Temp file first, keep the previous copy as a
 * backup, then rename over the real one.
 */
function saveState(state) {
  const target = progressFile();
  const tmp = target + '.tmp';
  try {
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(tmp, JSON.stringify(state, null, 2), 'utf8');
    if (fs.existsSync(target)) {
      try { fs.copyFileSync(target, backupFile()); } catch (err) { /* backup is best effort */ }
    }
    fs.renameSync(tmp, target);
    return true;
  } catch (err) {
    console.error('save failed', err);
    try { fs.unlinkSync(tmp); } catch (err2) { /* nothing to clean */ }
    return false;
  }
}

/* ------------------------------------------------------- window bounds */

function boundsFile() {
  return path.join(app.getPath('userData'), 'window.json');
}

function loadBounds() {
  try {
    const b = readJson(boundsFile());
    if (typeof b.width !== 'number' || typeof b.height !== 'number') return null;
    return b;
  } catch (err) {
    return null;
  }
}

function saveBounds(win) {
  if (!win || win.isDestroyed()) return;
  try {
    const bounds = win.isMaximized() || win.isFullScreen() ? win.getNormalBounds() : win.getBounds();
    fs.writeFileSync(boundsFile(), JSON.stringify(
      Object.assign({}, bounds, { maximized: win.isMaximized() }), null, 2), 'utf8');
  } catch (err) { /* window position is not worth an error dialog */ }
}

/** Keep the restored window on a screen that actually exists right now. */
function visibleBounds(saved) {
  if (!saved) return null;
  const { screen } = require('electron');
  const area = screen.getDisplayMatching(saved).workArea;
  const width = Math.min(saved.width, area.width);
  const height = Math.min(saved.height, area.height);
  const x = Math.min(Math.max(saved.x, area.x), area.x + area.width - width);
  const y = Math.min(Math.max(saved.y, area.y), area.y + area.height - height);
  return { x, y, width, height, maximized: !!saved.maximized };
}

/* ----------------------------------------------------------- python probe */

let pythonCmd = undefined;

function findPython() {
  if (pythonCmd !== undefined) return pythonCmd;
  const candidates = process.platform === 'win32'
    ? [['py', ['-3']], ['python', []], ['python3', []]]
    : [['python3', []], ['python', []]];
  for (const [cmd, pre] of candidates) {
    try {
      const res = spawnSync(cmd, pre.concat(['-c', 'print(1)']), {
        encoding: 'utf8', timeout: 8000, windowsHide: true
      });
      if (res.status === 0 && String(res.stdout).trim() === '1') {
        pythonCmd = { cmd, pre };
        return pythonCmd;
      }
    } catch (err) { /* try next */ }
  }
  pythonCmd = null;
  return null;
}

function runPython(code, stdin, timeoutMs) {
  return new Promise((resolve) => {
    const py = findPython();
    if (!py) {
      resolve({ ok: false, stdout: '', stderr: 'No Python interpreter found on this machine.', timedOut: false, missing: true });
      return;
    }
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'codingo-'));
    const file = path.join(dir, 'main.py');
    fs.writeFileSync(file, code, 'utf8');

    const child = spawn(py.cmd, py.pre.concat([file]), {
      cwd: dir,
      windowsHide: true,
      env: Object.assign({}, process.env, { PYTHONIOENCODING: 'utf-8', PYTHONDONTWRITEBYTECODE: '1' })
    });

    let stdout = '';
    let stderr = '';
    let timedOut = false;
    const cap = 64 * 1024;

    const timer = setTimeout(() => {
      timedOut = true;
      try { child.kill('SIGKILL'); } catch (err) { /* already gone */ }
    }, timeoutMs || 6000);

    child.stdout.on('data', (d) => { if (stdout.length < cap) stdout += d.toString(); });
    child.stderr.on('data', (d) => { if (stderr.length < cap) stderr += d.toString(); });
    child.on('error', (err) => {
      clearTimeout(timer);
      resolve({ ok: false, stdout: '', stderr: String(err.message), timedOut: false });
    });
    child.on('close', (code) => {
      clearTimeout(timer);
      try { fs.rmSync(dir, { recursive: true, force: true }); } catch (err) { /* leave temp */ }
      resolve({
        ok: !timedOut && code === 0,
        exitCode: code,
        stdout,
        stderr: timedOut ? (stderr + '\nExecution timed out.') : stderr,
        timedOut
      });
    });

    if (stdin) child.stdin.write(stdin);
    child.stdin.end();
  });
}

/* --------------------------------------------------------------- ipc wire */

ipcMain.handle('state:load', () => loadState());
ipcMain.handle('state:save', (_e, state) => saveState(state));
ipcMain.handle('state:reset', () => {
  const fresh = Object.assign({}, DEFAULT_STATE);
  saveState(fresh);
  return fresh;
});
ipcMain.handle('python:available', () => !!findPython());
ipcMain.handle('python:run', (_e, payload) => runPython(payload.code, payload.stdin, payload.timeoutMs));
ipcMain.handle('app:openExternal', (_e, url) => {
  if (/^https?:\/\//i.test(url)) shell.openExternal(url);
});

/* ------------------------------------------------------------ arena ipc */

const arena = require('./arena-engine');
const problems = require('./arena-problems');

ipcMain.handle('arena:newPool', (_e, size) => arena.makePool(size || 150));
ipcMain.handle('arena:drift', (_e, payload) => arena.driftPool(payload.pool, payload.days));
ipcMain.handle('arena:standings', (_e, payload) => {
  const st = arena.standings(payload.pool, payload.me);
  return {
    rank: st.rank,
    total: st.total,
    percentile: st.percentile,
    tier: st.tier,
    top: st.all.slice(0, 60),
    around: st.all.slice(Math.max(0, st.rank - 4), st.rank + 3)
  };
});
ipcMain.handle('arena:queue', (_e, payload) =>
  arena.findOpponent(payload.pool, payload.me, payload.waitedMs, payload.excludeIds));
ipcMain.handle('arena:tiers', () => arena.TIERS);
ipcMain.handle('arena:season', (_e, season) => arena.seasonInfo(season));
ipcMain.handle('arena:softReset', (_e, me) => arena.softReset(me));
ipcMain.handle('arena:simOpponent', (_e, payload) =>
  arena.simulateOpponent(payload.bot, payload.difficulty, payload.limitSeconds));

ipcMain.handle('arena:problem', (_e, payload) => {
  const list = payload.mode === 'debug' ? problems.DEBUG_PROBLEMS : problems.VIBECODE_PROBLEMS;
  const chosen = problems.pick(list, payload.avoidIds, payload.difficultyTarget);
  return problems.publicView(chosen, payload.mode);
});

// The client never marks its own code: it submits, the main process runs the hidden tests.
ipcMain.handle('arena:judge', async (_e, payload) => {
  const problem = problems.byId(payload.problemId);
  if (!problem) return { ok: false, error: 'unknown problem' };
  const program = problems.buildHarness(payload.code, problem.tests);
  const res = await runPython(program, '', 8000);
  const verdict = problems.parseVerdict(res.stdout);
  if (!verdict) {
    return {
      ok: false,
      passed: 0,
      total: problem.tests.length,
      cases: [],
      stderr: res.timedOut
        ? 'Timed out. The code never finished — look for a loop whose condition never becomes false.'
        : (res.stderr || 'The program produced no verdict — it probably crashed before the tests ran.'),
      timedOut: res.timedOut
    };
  }
  const cases = verdict.map(([expr, got, want, pass]) => ({ expr, got, want, ok: pass }));
  const passed = cases.filter((c) => c.ok).length;
  return { ok: passed === cases.length, passed, total: cases.length, cases, stderr: res.stderr, timedOut: res.timedOut };
});

ipcMain.handle('arena:rate', (_e, payload) => {
  const me = arena.rate(payload.me, [{ rating: payload.opponent.rating, rd: payload.opponent.rd, score: payload.score }]);
  const opponent = arena.rate(payload.opponent, [{ rating: payload.me.rating, rd: payload.me.rd, score: 1 - payload.score }]);
  return { me, opponent };
});

// Teacher / learner report: a JSON snapshot plus a flat CSV of per-topic mastery,
// so progress can leave the app and be looked at by someone else.
ipcMain.handle('report:export', async (_e, payload) => {
  const stamp = new Date().toISOString().slice(0, 10);
  const res = await dialog.showSaveDialog(mainWindow, {
    title: 'Export progress report',
    defaultPath: path.join(app.getPath('documents'), `codingo-report-${stamp}.json`),
    filters: [
      { name: 'JSON report', extensions: ['json'] },
      { name: 'CSV table', extensions: ['csv'] }
    ]
  });
  if (res.canceled || !res.filePath) return { ok: false, canceled: true };
  try {
    const asCsv = res.filePath.toLowerCase().endsWith('.csv');
    fs.writeFileSync(res.filePath, asCsv ? payload.csv : JSON.stringify(payload.json, null, 2), 'utf8');
    return { ok: true, path: res.filePath };
  } catch (err) {
    return { ok: false, error: String(err.message) };
  }
});

/* ------------------------------------------------------------------ window */

function createWindow() {
  const saved = visibleBounds(loadBounds());

  mainWindow = new BrowserWindow(Object.assign({
    width: 1180,
    height: 820,
    minWidth: 900,
    minHeight: 640,
    backgroundColor: '#0f1420',
    title: 'Codingo',
    icon: path.join(__dirname, 'build', 'icon.png'),
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      spellcheck: false
    }
  }, saved ? { x: saved.x, y: saved.y, width: saved.width, height: saved.height } : {}));

  if (saved && saved.maximized) mainWindow.maximize();

  mainWindow.loadFile(path.join(__dirname, 'src', 'index.html'));
  mainWindow.once('ready-to-show', () => mainWindow.show());
  if (isDev) mainWindow.webContents.openDevTools({ mode: 'detach' });

  let boundsTimer = null;
  const rememberBounds = () => {
    clearTimeout(boundsTimer);
    boundsTimer = setTimeout(() => saveBounds(mainWindow), 400);
  };
  mainWindow.on('resize', rememberBounds);
  mainWindow.on('move', rememberBounds);
  mainWindow.on('close', () => { clearTimeout(boundsTimer); saveBounds(mainWindow); });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:\/\//i.test(url)) shell.openExternal(url);
    return { action: 'deny' };
  });

  // The window only ever shows the bundled page; anything else is a bug or an attack.
  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (!url.startsWith('file://')) {
      event.preventDefault();
      if (/^https?:\/\//i.test(url)) shell.openExternal(url);
    }
  });

  mainWindow.webContents.on('render-process-gone', (_e, details) => {
    dialog.showErrorBox('Codingo stopped responding',
      'The window closed unexpectedly (' + details.reason + '). Your progress was saved after the last answer.');
  });
}

/* -------------------------------------------------------------- menu */

function buildMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        { label: 'Export progress report…', click: () => mainWindow && mainWindow.webContents.send('menu:export') },
        { type: 'separator' },
        { role: process.platform === 'darwin' ? 'close' : 'quit' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
        ...(isDev ? [{ type: 'separator' }, { role: 'reload' }, { role: 'toggleDevTools' }] : [])
      ]
    },
    {
      label: 'Help',
      submenu: [
        { label: 'Keyboard shortcuts', click: () => mainWindow && mainWindow.webContents.send('menu:shortcuts') },
        { label: 'Open data folder', click: () => shell.openPath(app.getPath('userData')) },
        { type: 'separator' },
        {
          label: 'About Codingo',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'About Codingo',
              message: 'Codingo ' + app.getVersion(),
              detail: [
                'Gamified e-learning for STEM and coding.',
                '',
                'Electron ' + process.versions.electron + '  ·  Chromium ' + process.versions.chrome,
                'Node ' + process.versions.node,
                'Python: ' + (findPython() ? findPython().cmd + ' found' : 'not found'),
                '',
                'Runs offline. No account, no telemetry, no network calls.'
              ].join('\n'),
              buttons: ['Close']
            });
          }
        }
      ]
    }
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

ipcMain.handle('app:info', () => ({
  version: app.getVersion(),
  electron: process.versions.electron,
  chrome: process.versions.chrome,
  node: process.versions.node,
  platform: process.platform,
  dataPath: app.getPath('userData'),
  python: findPython() ? findPython().cmd : null
}));

ipcMain.handle('app:recheckPython', () => {
  pythonCmd = undefined;          // forget the cached probe and look again
  return !!findPython();
});

/* -------------------------------------------------------------- start */

// A second copy would fight the first over the same progress file.
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (!mainWindow) return;
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  });

  app.whenReady().then(() => {
    buildMenu();
    createWindow();
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
  });
}
