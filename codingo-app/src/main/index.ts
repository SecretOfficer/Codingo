import { app, BrowserWindow, ipcMain, safeStorage } from 'electron'
import { join } from 'node:path'
import { readFile, unlink, writeFile } from 'node:fs/promises'

const sessionFile = (): string => join(app.getPath('userData'), 'supabase-session.bin')

ipcMain.handle('auth-storage:get', async (): Promise<string | null> => {
  try {
    const encrypted = await readFile(sessionFile())
    return safeStorage.decryptString(encrypted)
  } catch {
    return null
  }
})

ipcMain.handle('auth-storage:set', async (_event, value: unknown): Promise<void> => {
  if (typeof value !== 'string') throw new Error('Authentication storage accepts strings only.')
  if (!safeStorage.isEncryptionAvailable()) throw new Error('Secure session storage is unavailable on this device.')
  await writeFile(sessionFile(), safeStorage.encryptString(value))
})

ipcMain.handle('auth-storage:remove', async (): Promise<void> => {
  try { await unlink(sessionFile()) } catch { /* The session is already cleared. */ }
})

function createWindow(): void {
  const window = new BrowserWindow({
    width: 1260,
    height: 820,
    minWidth: 960,
    minHeight: 680,
    backgroundColor: '#f5f7f4',
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  })

  if (process.env.ELECTRON_RENDERER_URL) {
    window.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    window.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  createWindow()
  app.on('activate', () => BrowserWindow.getAllWindows().length === 0 && createWindow())
})

app.on('window-all-closed', () => process.platform !== 'darwin' && app.quit())
