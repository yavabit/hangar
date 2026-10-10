import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { registerSettingsIpc } from './ipc/settings.ipc'
import { registerProjectsIpc } from './ipc/projects.ipc'
import { registerFileSystemIpc } from './ipc/file-system.ipc'
import { registerAppIpc } from './ipc/app.ipc'
import { registerFoldersIpc } from './ipc/folders.ipc'
import { ProjectService } from './services/projects.service'

const LAST_OPENED_REFRESH_INTERVAL_MS = 5 * 60 * 1000;

function createWindow(): BrowserWindow {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1400,
    height: 800,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
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

  return mainWindow
}

app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  registerAppIpc();

  registerSettingsIpc();

  registerFoldersIpc();

  registerProjectsIpc();

  registerFileSystemIpc();

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  const mainWindow = createWindow()
  startLastOpenedRefresh(mainWindow)

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })

  function startLastOpenedRefresh(window: BrowserWindow): void {
    const refresh = async (): Promise<void> => {
      try {
        const allProjects = await ProjectService.refreshLastOpenedTimestamps();
        window.webContents.send("app:lastOpenedUpdated", allProjects);
      } catch (error) {
        console.error("Failed to refresh project lastOpened timestamps", error);
      }
    };

    void refresh();
    setInterval(refresh, LAST_OPENED_REFRESH_INTERVAL_MS);
  }
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
