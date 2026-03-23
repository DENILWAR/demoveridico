import { contextBridge, ipcRenderer } from 'electron'

// Type definitions for exposed APIs
export interface ElectronAPI {
  // App info
  app: {
    getInfo: () => Promise<{
      name: string
      version: string
      platform: string
      arch: string
      paths: {
        userData: string
        certificates: string
        backups: string
      }
    }>
    getTheme: () => Promise<'light' | 'dark'>
    setTheme: (theme: 'light' | 'dark' | 'system') => Promise<'light' | 'dark'>
  }

  // Dialogs
  dialog: {
    openFile: (options?: {
      title?: string
      filters?: Array<{ name: string; extensions: string[] }>
      defaultPath?: string
    }) => Promise<string | null>
    saveFile: (options?: {
      title?: string
      defaultPath?: string
      filters?: Array<{ name: string; extensions: string[] }>
    }) => Promise<string | null>
  }

  // File system (restricted)
  fs: {
    readFile: (path: string) => Promise<{ success: boolean; data?: string; error?: string }>
    writeFile: (path: string, data: string) => Promise<{ success: boolean; error?: string }>
  }

  // Certificate operations
  certificate: {
    import: (filePath: string) => Promise<{ success: boolean; path?: string; error?: string }>
    delete: (certPath: string) => Promise<{ success: boolean; error?: string }>
    list: () => Promise<string[]>
  }

  // Backup operations
  backup: {
    create: (data: string) => Promise<{ success: boolean; path?: string; error?: string }>
    restore: (filePath: string) => Promise<{ success: boolean; data?: string; error?: string }>
    list: () => Promise<Array<{ name: string; path: string; date: Date }>>
  }

  // Shell operations
  shell: {
    openExternal: (url: string) => Promise<boolean>
    showItemInFolder: (path: string) => Promise<boolean>
  }

  // Print
  print: {
    preview: () => Promise<void>
  }

  // Notifications
  notification: {
    show: (options: { title: string; body: string }) => Promise<boolean>
  }
}

// Expose protected APIs to renderer
contextBridge.exposeInMainWorld('electron', {
  // App
  app: {
    getInfo: () => ipcRenderer.invoke('app:getInfo'),
    getTheme: () => ipcRenderer.invoke('app:getTheme'),
    setTheme: (theme: 'light' | 'dark' | 'system') => ipcRenderer.invoke('app:setTheme', theme),
  },

  // Dialogs
  dialog: {
    openFile: (options?: {
      title?: string
      filters?: Array<{ name: string; extensions: string[] }>
      defaultPath?: string
    }) => ipcRenderer.invoke('dialog:openFile', options || {}),
    saveFile: (options?: {
      title?: string
      defaultPath?: string
      filters?: Array<{ name: string; extensions: string[] }>
    }) => ipcRenderer.invoke('dialog:saveFile', options || {}),
  },

  // File system
  fs: {
    readFile: (path: string) => ipcRenderer.invoke('fs:readFile', path),
    writeFile: (path: string, data: string) => ipcRenderer.invoke('fs:writeFile', path, data),
  },

  // Certificate
  certificate: {
    import: (filePath: string) => ipcRenderer.invoke('certificate:import', filePath),
    delete: (certPath: string) => ipcRenderer.invoke('certificate:delete', certPath),
    list: () => ipcRenderer.invoke('certificate:list'),
  },

  // Backup
  backup: {
    create: (data: string) => ipcRenderer.invoke('backup:create', data),
    restore: (filePath: string) => ipcRenderer.invoke('backup:restore', filePath),
    list: () => ipcRenderer.invoke('backup:list'),
  },

  // Shell
  shell: {
    openExternal: (url: string) => ipcRenderer.invoke('shell:openExternal', url),
    showItemInFolder: (path: string) => ipcRenderer.invoke('shell:showItemInFolder', path),
  },

  // Print
  print: {
    preview: () => ipcRenderer.invoke('print:preview'),
  },

  // Notifications
  notification: {
    show: (options: { title: string; body: string }) =>
      ipcRenderer.invoke('notification:show', options),
  },
} as ElectronAPI)

// Declare window type augmentation
declare global {
  interface Window {
    electron: ElectronAPI
  }
}
