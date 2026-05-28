import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { spawn } from 'child_process'
import { exec } from 'child_process'
import {
  existsSync,
  mkdirSync,
  createWriteStream,
  unlinkSync,
} from 'fs'
import * as https from 'https'
import * as http from 'http'
import { autoUpdater } from 'electron-updater'
import icon from '../../resources/icon.png?asset'

let mainWindow: BrowserWindow | null = null

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 960,
    show: false,
    frame: false,
    titleBarStyle: 'hidden',
    autoHideMenuBar: true,
    ...(process.platform !== 'darwin' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      devTools: true
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })


  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}


app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.video.tools')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
    
    window.webContents.on('before-input-event', (_event, input) => {
      if (input.key === 'F12') {
        if (window.webContents.isDevToolsOpened()) {
          window.webContents.closeDevTools()
        } else {
          window.webContents.openDevTools()
        }
      }
    })
  })

  ipcMain.on('ping', () => console.log('pong'))

  autoUpdater.autoDownload = false
  autoUpdater.autoInstallOnAppQuit = true

  autoUpdater.on('checking-for-update', () => {
    console.log('正在检查更新...')
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('update-checking')
    }
  })

  autoUpdater.on('update-available', (info) => {
    console.log('发现新版本:', info.version)
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('update-available', {
        version: info.version,
        releaseDate: info.releaseDate,
        releaseNotes: info.releaseNotes
      })
    }
  })

  autoUpdater.on('update-not-available', () => {
    console.log('当前已是最新版本')
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('update-not-available')
    }
  })

  autoUpdater.on('error', (error) => {
    console.error('更新检查失败:', error)
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('update-error', { message: error.message })
    }
  })

  autoUpdater.on('download-progress', (progressObj) => {
    const percent = Math.round(progressObj.percent)
    console.log(`下载进度: ${percent}%`)
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('update-download-progress', {
        percent,
        transferred: progressObj.transferred,
        total: progressObj.total
      })
    }
  })

  autoUpdater.on('update-downloaded', (info) => {
    console.log('更新下载完成:', info.version)
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('update-downloaded', {
        version: info.version,
        releaseDate: info.releaseDate,
        releaseNotes: info.releaseNotes
      })
    }
  })

  ipcMain.handle('update-check', async (_, updateServerUrl?: string) => {
    try {
      if (updateServerUrl) {
        autoUpdater.setFeedURL({ provider: 'generic', url: updateServerUrl })
      }
      const result = await autoUpdater.checkForUpdates()
      return { success: true, updateInfo: result?.updateInfo }
    } catch (error: any) {
      console.error('检查更新失败:', error)
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('update-download', async () => {
    try {
      await autoUpdater.downloadUpdate()
      return { success: true }
    } catch (error: any) {
      console.error('下载更新失败:', error)
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('update-install', async () => {
    try {
      autoUpdater.quitAndInstall(false, true)
      return { success: true }
    } catch (error: any) {
      console.error('安装更新失败:', error)
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('update-download-and-install', async (_, downloadUrl: string, version: string, description: string, _forceUpdate: boolean) => {
    try {
      if (mainWindow) {
        mainWindow.webContents.send('update-download-start', { version, description })
      }

      const userDataDir = app.getPath('userData')
      const updateDir = join(userDataDir, 'updates')
      if (!existsSync(updateDir)) {
        mkdirSync(updateDir, { recursive: true })
      }

      const fileName = downloadUrl.split('/').pop() || `update-${version}.exe`
      const filePath = join(updateDir, fileName)

      return new Promise((resolve, reject) => {
        const file = createWriteStream(filePath)
        const protocol = downloadUrl.startsWith('https') ? https : http

        protocol.get(downloadUrl, (response) => {
          if (response.statusCode !== 200) {
            reject(new Error(`下载失败: HTTP ${response.statusCode}`))
            return
          }

          const totalSize = parseInt(response.headers['content-length'] || '0', 10)
          let downloadedSize = 0

          response.on('data', (chunk) => {
            downloadedSize += chunk.length
            const percent = totalSize > 0 ? Math.round((downloadedSize / totalSize) * 100) : 0
            
            if (mainWindow && !mainWindow.isDestroyed()) {
              mainWindow.webContents.send('update-download-progress', {
                percent,
                transferred: downloadedSize,
                total: totalSize
              })
            }
          })

          response.pipe(file)

          file.on('finish', () => {
            file.close()
            if (mainWindow && !mainWindow.isDestroyed()) {
              mainWindow.webContents.send('update-downloaded', {
                version,
                filePath
              })
            }
            resolve({ success: true, filePath, version })
          })

          file.on('error', (err) => {
            unlinkSync(filePath)
            reject(err)
          })
        }).on('error', (err) => {
          reject(err)
        })
      })
    } catch (error: any) {
      console.error('下载更新失败:', error)
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('update-install-manual', async (_, filePath: string) => {
    try {
      spawn(filePath, [], { detached: true, stdio: 'ignore' })
      app.quit()
      return { success: true }
    } catch (error: any) {
      console.error('安装更新失败:', error)
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('window-minimize', () => {
    const window = BrowserWindow.getFocusedWindow()
    if (window) window.minimize()
  })

  ipcMain.handle('window-maximize', () => {
    const window = BrowserWindow.getFocusedWindow()
    if (window) {
      if (window.isMaximized()) {
        window.unmaximize()
      } else {
        window.maximize()
      }
    }
  })

  ipcMain.handle('window-close', () => {
    const window = BrowserWindow.getFocusedWindow()
    if (window) window.close()
  })

  ipcMain.handle('window-reload', () => {
    const window = BrowserWindow.getFocusedWindow()
    if (window) window.webContents.reload()
  })

  ipcMain.handle('window-is-maximized', () => {
    const window = BrowserWindow.getFocusedWindow()
    return window ? window.isMaximized() : false
  })

  ipcMain.handle('select-file', async (_, options) => {
    const window = BrowserWindow.getFocusedWindow()
    if (!window) return null

    const result = await dialog.showOpenDialog(window, {
      title: options.title || '选择文件',
      filters: options.filters || [
        { name: '视频文件', extensions: ['mp4', 'avi', 'mov', 'mkv', 'wmv', 'flv', 'webm'] },
        { name: '所有文件', extensions: ['*'] }
      ],
      properties: ['openFile']
    })

    return result.canceled ? null : result.filePaths[0]
  })

  ipcMain.handle('select-directory', async (_, options) => {
    const window = BrowserWindow.getFocusedWindow()
    if (!window) return null

    const result = await dialog.showOpenDialog(window, {
      title: options.title || '选择文件夹',
      properties: ['openDirectory']
    })

    return result.canceled ? null : result.filePaths[0]
  })

  let ffmpegProcess: any = null

  ipcMain.handle('execute-ffmpeg', async (_, command: string, options: { 
    inputA: string
    inputB: string
    output: string
  }) => {
    try {
      const ffmpegPath = app.isPackaged 
        ? join(process.resourcesPath, 'app.asar.unpacked', 'ffmpeg', 'bin', 'ffmpeg.exe')
        : join(process.cwd(), 'ffmpeg', 'bin', 'ffmpeg.exe')
      
      const args: string[] = []
      
      const commandParts = parseCommand(command)
      
      for (const part of commandParts) {
        console.log('part:', part)
        if (part === '{inputA}') {
          args.push(`"${options.inputA}"`)
        } else if (part === '{inputB}') {
          args.push(`"${options.inputB}"`)
        } else if (part === '{output}') {
          args.push(`"${options.output}"`)
        } else if (part !== 'ffmpeg') {
          args.push(part)
        }
      }
      
      console.log('FFmpeg exec:', ffmpegPath, args.join(' '))
      
      ffmpegProcess = spawn(ffmpegPath, args, {
        stdio: ['pipe', 'pipe', 'pipe'],
        shell: true
      })

      setupFFmpegListeners()

      return { success: true, processId: ffmpegProcess.pid }
    } catch (error) {
      console.error('FFmpeg failed:', error)
      return { success: false, error: error instanceof Error ? error.message : String(error) }
    }
  })


  function parseCommand(command: string): string[] {
    const args: string[] = []
    let current = ''
    let inQuotes = false
    let quoteChar = ''
    
    for (let i = 0; i < command.length; i++) {
      const char = command[i]
      
      if ((char === '"' || char === "'") && !inQuotes) {
        inQuotes = true
        quoteChar = char
        current += char
      } else if (char === quoteChar && inQuotes) {
        inQuotes = false
        quoteChar = ''
        current += char
      } else if (char === ' ' && !inQuotes) {
        if (current.trim()) {
          args.push(current.trim())
          current = ''
        }
      } else {
        current += char
      }
    }
    
    if (current.trim()) {
      args.push(current.trim())
    }
    
    return args
  }

  let ffmpegLogs: string[] = []
  let ffmpegProgress = 0
  let ffmpegIsRunning = false
  let videoDuration = 0

  ipcMain.handle('get-ffmpeg-output', () => {
    return new Promise((resolve) => {
      if (!ffmpegProcess) {
        resolve({ logs: ffmpegLogs, progress: ffmpegProgress, isRunning: ffmpegIsRunning })
        return
      }

      resolve({ logs: [...ffmpegLogs], progress: ffmpegProgress, isRunning: ffmpegIsRunning })
    })
  })

  const setupFFmpegListeners = () => {
    if (!ffmpegProcess) return

    ffmpegIsRunning = true
    ffmpegLogs = []
    ffmpegProgress = 0

    ffmpegProcess.stdout?.on('data', (data: Buffer) => {
      const output = data.toString()
      ffmpegLogs.push(output)
      console.log('FFmpeg stdout:', output)
    })

    ffmpegProcess.stderr?.on('data', (data: Buffer) => {
      const output = data.toString()
      ffmpegLogs.push(output)
      console.log('FFmpeg stderr:', output)
      
      const durationMatch = output.match(/Duration: (\d+):(\d+):(\d+\.\d+)/)
      if (durationMatch && videoDuration === 0) {
        const hours = parseInt(durationMatch[1])
        const minutes = parseInt(durationMatch[2])
        const seconds = parseFloat(durationMatch[3])
        videoDuration = hours * 3600 + minutes * 60 + seconds
        ffmpegLogs.push(`检测到视频时长: ${hours}:${minutes}:${seconds.toFixed(2)}`)
      }
      
      const progressMatch = output.match(/time=(\d+):(\d+):(\d+\.\d+)/)
      if (progressMatch && videoDuration > 0) {
        const hours = parseInt(progressMatch[1])
        const minutes = parseInt(progressMatch[2])
        const seconds = parseFloat(progressMatch[3])
        const currentSeconds = hours * 3600 + minutes * 60 + seconds
        
        ffmpegProgress = Math.min(Math.floor((currentSeconds / videoDuration) * 100), 100)
        ffmpegLogs.push(`处理进度: ${ffmpegProgress}%`)
      }
    })

    ffmpegProcess.on('close', (code: number) => {
      ffmpegIsRunning = false
      ffmpegLogs.push(`进程结束，退出码: ${code}`)
      if (code === 0) {
        ffmpegLogs.push('处理成功！')
        ffmpegProgress = 100
      } else {
        ffmpegLogs.push('处理失败！')
      }
    })

    ffmpegProcess.on('error', (error: Error) => {
      ffmpegIsRunning = false
      ffmpegLogs.push(`FFmpeg进程错误: ${error.message}`)
    })
  }

  ipcMain.handle('stop-ffmpeg', async () => {
    if (ffmpegProcess) {
      try {
        const pid = ffmpegProcess.pid
        console.log(`stop PID: ${pid}`)
        console.log(`process.platform: ${process.platform}`)
        
        if (process.platform === 'win32') {
          exec(`taskkill /F /T /PID ${pid}`, (error) => {
            if (error) {
              console.log('taskkill failed:', error.message)
            } else {
              console.log('FFmpeg stopped')
            }
          })
        } else {
          exec(`kill -9 ${pid}`, (error) => {
            if (error) {
              console.log('kill -9 failed:', error.message)
            } else {
              console.log('FFmpeg stopped')
            }
          })
        }
        
        ffmpegProcess = null
        ffmpegIsRunning = false
        ffmpegLogs.push('用户手动停止处理')
        return { success: true }
      } catch (error) {
        console.error('Failed to stop FFmpeg process:', error)
        ffmpegProcess = null
        ffmpegIsRunning = false
        ffmpegLogs.push('停止进程时出错')
        return { success: false, message: '停止进程时出错' }
      }
    }
    return { success: false, message: '没有正在运行的FFmpeg进程' }
  })

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})


app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

