import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      windowMinimize: () => Promise<void>
      windowMaximize: () => Promise<void>
      windowClose: () => Promise<void>
      windowReload: () => Promise<void>
      windowIsMaximized: () => Promise<boolean>
      selectFile: (options?: { title?: string; filters?: Array<{ name: string; extensions: string[] }> }) => Promise<string | null>
      selectDirectory: (options?: { title?: string }) => Promise<string | null>
      executeFFmpeg: (command: string, options: { inputA: string; inputB: string; output: string }) => Promise<{ success: boolean; processId?: number; error?: string }>
      getFFmpegOutput: () => Promise<{ logs: string[]; progress: number; isRunning: boolean }>
      stopFFmpeg: () => Promise<{ success: boolean; message?: string }>
      updateCheck: (updateServerUrl?: string) => Promise<{ success: boolean; updateInfo?: any; error?: string }>
      updateDownload: () => Promise<{ success: boolean; error?: string }>
      updateInstall: () => Promise<{ success: boolean; error?: string }>
      updateDownloadAndInstall: (downloadUrl: string, version: string, description: string, forceUpdate: boolean) => Promise<{ success: boolean; filePath?: string; version?: string; error?: string }>
      updateInstallManual: (filePath: string) => Promise<{ success: boolean; error?: string }>
      onUpdateChecking: (callback: () => void) => () => void
      onUpdateAvailable: (callback: (info: { version: string; releaseDate?: string; releaseNotes?: string }) => void) => () => void
      onUpdateNotAvailable: (callback: () => void) => () => void
      onUpdateError: (callback: (error: { message: string }) => void) => () => void
      onUpdateDownloadProgress: (callback: (progress: { percent: number; transferred: number; total: number }) => void) => () => void
      onUpdateDownloaded: (callback: (info: { version: string; releaseDate?: string; releaseNotes?: string; filePath?: string }) => void) => () => void
      onUpdateDownloadStart: (callback: (info: { version: string; description: string }) => void) => () => void
    }
  }
}
