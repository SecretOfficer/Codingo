import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('codingo', {
  platform: process.platform,
  authStorage: {
    get: (): Promise<string | null> => ipcRenderer.invoke('auth-storage:get'),
    set: (value: string): Promise<void> => ipcRenderer.invoke('auth-storage:set', value),
    remove: (): Promise<void> => ipcRenderer.invoke('auth-storage:remove')
  }
})
