import { app, BrowserWindow, ipcMain, dialog, shell, nativeTheme } from 'electron'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Environment
const isDev = process.env.NODE_ENV === 'development'
const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL

// Main window
let mainWindow: BrowserWindow | null = null

// App paths
const APP_DATA_PATH = app.getPath('userData')
const CERTIFICATES_PATH = path.join(APP_DATA_PATH, 'certificates')
const BACKUP_PATH = path.join(APP_DATA_PATH, 'backups')

// Ensure directories exist
function ensureDirectories() {
  const dirs = [CERTIFICATES_PATH, BACKUP_PATH]
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
  }
}

// Create main window
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    title: 'Veridico - Sistema de Facturación',
    icon: path.join(__dirname, '../public/icon.png'),
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    trafficLightPosition: { x: 15, y: 15 },
    backgroundColor: '#F5F7FA',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  })

  // Load app
  if (VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(VITE_DEV_SERVER_URL)
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      shell.openExternal(url)
    }
    return { action: 'deny' }
  })

  // Window events
  mainWindow.on('closed', () => {
    mainWindow = null
  })

  // Prevent navigation to external URLs
  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (!url.startsWith('file://') && !url.startsWith(VITE_DEV_SERVER_URL || '')) {
      event.preventDefault()
      shell.openExternal(url)
    }
  })
}

// App ready
app.whenReady().then(() => {
  ensureDirectories()
  createWindow()

  // macOS: Re-create window when dock icon clicked
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

// Quit when all windows closed (except macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// Security: Prevent new window creation
app.on('web-contents-created', (_, contents) => {
  contents.setWindowOpenHandler(() => {
    return { action: 'deny' }
  })
})

// ============================================
// IPC Handlers
// ============================================

// Get app info
ipcMain.handle('app:getInfo', () => {
  return {
    name: app.getName(),
    version: app.getVersion(),
    platform: process.platform,
    arch: process.arch,
    paths: {
      userData: APP_DATA_PATH,
      certificates: CERTIFICATES_PATH,
      backups: BACKUP_PATH,
    },
  }
})

// Get system theme
ipcMain.handle('app:getTheme', () => {
  return nativeTheme.shouldUseDarkColors ? 'dark' : 'light'
})

// Set theme
ipcMain.handle('app:setTheme', (_, theme: 'light' | 'dark' | 'system') => {
  nativeTheme.themeSource = theme
  return nativeTheme.shouldUseDarkColors ? 'dark' : 'light'
})

// Show open file dialog
ipcMain.handle('dialog:openFile', async (_, options: {
  title?: string
  filters?: Array<{ name: string; extensions: string[] }>
  defaultPath?: string
}) => {
  if (!mainWindow) return null

  const result = await dialog.showOpenDialog(mainWindow, {
    title: options.title || 'Seleccionar archivo',
    filters: options.filters || [{ name: 'Todos los archivos', extensions: ['*'] }],
    defaultPath: options.defaultPath,
    properties: ['openFile'],
  })

  if (result.canceled || result.filePaths.length === 0) {
    return null
  }

  return result.filePaths[0]
})

// Show save file dialog
ipcMain.handle('dialog:saveFile', async (_, options: {
  title?: string
  defaultPath?: string
  filters?: Array<{ name: string; extensions: string[] }>
}) => {
  if (!mainWindow) return null

  const result = await dialog.showSaveDialog(mainWindow, {
    title: options.title || 'Guardar archivo',
    defaultPath: options.defaultPath,
    filters: options.filters || [{ name: 'Todos los archivos', extensions: ['*'] }],
  })

  if (result.canceled || !result.filePath) {
    return null
  }

  return result.filePath
})

// Read file
ipcMain.handle('fs:readFile', async (_, filePath: string) => {
  try {
    const content = fs.readFileSync(filePath)
    return { success: true, data: content.toString('base64') }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
})

// Write file
ipcMain.handle('fs:writeFile', async (_, filePath: string, data: string) => {
  try {
    const buffer = Buffer.from(data, 'base64')
    fs.writeFileSync(filePath, buffer)
    return { success: true }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
})

// Certificate operations
ipcMain.handle('certificate:import', async (_, filePath: string) => {
  try {
    const fileName = path.basename(filePath)
    const destPath = path.join(CERTIFICATES_PATH, fileName)
    fs.copyFileSync(filePath, destPath)
    return { success: true, path: destPath }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
})

ipcMain.handle('certificate:delete', async (_, certPath: string) => {
  try {
    if (certPath.startsWith(CERTIFICATES_PATH) && fs.existsSync(certPath)) {
      fs.unlinkSync(certPath)
      return { success: true }
    }
    return { success: false, error: 'Ruta de certificado no válida' }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
})

ipcMain.handle('certificate:list', async () => {
  try {
    const files = fs.readdirSync(CERTIFICATES_PATH)
    return files.filter(f => f.endsWith('.p12') || f.endsWith('.pfx'))
  } catch {
    return []
  }
})

// Backup operations
ipcMain.handle('backup:create', async (_, data: string) => {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const fileName = `veridico-backup-${timestamp}.json`
    const filePath = path.join(BACKUP_PATH, fileName)
    fs.writeFileSync(filePath, data, 'utf-8')
    return { success: true, path: filePath }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
})

ipcMain.handle('backup:restore', async (_, filePath: string) => {
  try {
    const content = fs.readFileSync(filePath, 'utf-8')
    return { success: true, data: content }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
})

ipcMain.handle('backup:list', async () => {
  try {
    const files = fs.readdirSync(BACKUP_PATH)
    return files
      .filter(f => f.endsWith('.json'))
      .map(f => ({
        name: f,
        path: path.join(BACKUP_PATH, f),
        date: fs.statSync(path.join(BACKUP_PATH, f)).mtime,
      }))
      .sort((a, b) => b.date.getTime() - a.date.getTime())
  } catch {
    return []
  }
})

// Open external URL
ipcMain.handle('shell:openExternal', async (_, url: string) => {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    await shell.openExternal(url)
    return true
  }
  return false
})

// Show item in folder
ipcMain.handle('shell:showItemInFolder', async (_, filePath: string) => {
  shell.showItemInFolder(filePath)
  return true
})

// Print
ipcMain.handle('print:preview', async () => {
  if (mainWindow) {
    mainWindow.webContents.print({ silent: false, printBackground: true })
  }
})

// Notifications
ipcMain.handle('notification:show', async (_, options: {
  title: string
  body: string
}) => {
  const { Notification } = await import('electron')
  if (Notification.isSupported()) {
    new Notification(options).show()
    return true
  }
  return false
})
