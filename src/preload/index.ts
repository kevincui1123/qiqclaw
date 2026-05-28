import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

const api = {
  windowMinimize: () => ipcRenderer.invoke('window-minimize'),
  windowMaximize: () => ipcRenderer.invoke('window-maximize'),
  windowClose: () => ipcRenderer.invoke('window-close'),
  windowReload: () => ipcRenderer.invoke('window-reload'),
  windowIsMaximized: () => ipcRenderer.invoke('window-is-maximized'),
  
  selectFile: (options?: { title?: string; filters?: Array<{ name: string; extensions: string[] }> }) => 
    ipcRenderer.invoke('select-file', options),
  selectDirectory: (options?: { title?: string }) => 
    ipcRenderer.invoke('select-directory', options),
  
  executeFFmpeg: (command: string, options: { inputA: string; inputB: string; output: string }) =>
    ipcRenderer.invoke('execute-ffmpeg', command, options),
  getFFmpegOutput: () => ipcRenderer.invoke('get-ffmpeg-output'),
  stopFFmpeg: () => ipcRenderer.invoke('stop-ffmpeg'),
  
  updateCheck: (updateServerUrl?: string) => 
    ipcRenderer.invoke('update-check', updateServerUrl),
  updateDownload: () => 
    ipcRenderer.invoke('update-download'),
  updateInstall: () => 
    ipcRenderer.invoke('update-install'),
  updateDownloadAndInstall: (downloadUrl: string, version: string, description: string, forceUpdate: boolean) =>
    ipcRenderer.invoke('update-download-and-install', downloadUrl, version, description, forceUpdate),
  updateInstallManual: (filePath: string) =>
    ipcRenderer.invoke('update-install-manual', filePath),
  
  onUpdateChecking: (callback: () => void) => {
    const wrappedCallback = () => callback()
    ipcRenderer.on('update-checking', wrappedCallback)
    return () => ipcRenderer.removeListener('update-checking', wrappedCallback)
  },
  onUpdateAvailable: (callback: (info: { version: string; releaseDate?: string; releaseNotes?: string }) => void) => {
    const wrappedCallback = (_event: Electron.IpcRendererEvent, info: { version: string; releaseDate?: string; releaseNotes?: string }) => callback(info)
    ipcRenderer.on('update-available', wrappedCallback)
    return () => ipcRenderer.removeListener('update-available', wrappedCallback)
  },
  onUpdateNotAvailable: (callback: () => void) => {
    const wrappedCallback = () => callback()
    ipcRenderer.on('update-not-available', wrappedCallback)
    return () => ipcRenderer.removeListener('update-not-available', wrappedCallback)
  },
  onUpdateError: (callback: (error: { message: string }) => void) => {
    const wrappedCallback = (_event: Electron.IpcRendererEvent, error: { message: string }) => callback(error)
    ipcRenderer.on('update-error', wrappedCallback)
    return () => ipcRenderer.removeListener('update-error', wrappedCallback)
  },
  onUpdateDownloadProgress: (callback: (progress: { percent: number; transferred: number; total: number }) => void) => {
    const wrappedCallback = (_event: Electron.IpcRendererEvent, progress: { percent: number; transferred: number; total: number }) => callback(progress)
    ipcRenderer.on('update-download-progress', wrappedCallback)
    return () => ipcRenderer.removeListener('update-download-progress', wrappedCallback)
  },
  onUpdateDownloaded: (callback: (info: { version: string; releaseDate?: string; releaseNotes?: string; filePath?: string }) => void) => {
    const wrappedCallback = (_event: Electron.IpcRendererEvent, info: { version: string; releaseDate?: string; releaseNotes?: string; filePath?: string }) => callback(info)
    ipcRenderer.on('update-downloaded', wrappedCallback)
    return () => ipcRenderer.removeListener('update-downloaded', wrappedCallback)
  },
  onUpdateDownloadStart: (callback: (info: { version: string; description: string }) => void) => {
    const wrappedCallback = (_event: Electron.IpcRendererEvent, info: { version: string; description: string }) => callback(info)
    ipcRenderer.on('update-download-start', wrappedCallback)
    return () => ipcRenderer.removeListener('update-download-start', wrappedCallback)
  }
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  window.electron = electronAPI
  window.api = api
}
