import { app, BrowserWindow, dialog, globalShortcut, nativeTheme } from 'electron'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import { registerSettingsIpc } from './ipc/settings.ipc'
import { registerProjectsIpc } from './ipc/projects.ipc'
import { registerFileSystemIpc } from './ipc/file-system.ipc'
import { registerAppIpc } from './ipc/app.ipc'
import { registerFoldersIpc } from './ipc/folders.ipc'
import { registerGitIpc } from './ipc/git.ipc'
import { registerDevIpc } from './ipc/dev.ipc'
import { store, validateStore } from './storage/store'
import { SettingsStorage } from './storage/settings.storage'
import { StatusService } from './services/status.service'
import { applyGlobalHotkey } from './hotkey'
import { createTray, showTrayHintOnce } from './tray'
import { createMainWindow, getMainWindow, sendToRenderer, setQuitting, showMainWindow } from './window'
import { createPaletteWindow } from './palette'

const PROJECTS_EVENT_DEBOUNCE_MS = 100

if (!app.requestSingleInstanceLock()) {
  app.quit()
} else {
  app.on('second-instance', showMainWindow)

  app.whenReady().then(() => {
    // Set app user model id for windows
    electronApp.setAppUserModelId('com.yavabit.hangar')

    const validation = validateStore()
    nativeTheme.themeSource = SettingsStorage.get().appearance.theme

    registerAppIpc()
    registerSettingsIpc()
    registerFoldersIpc()
    registerProjectsIpc()
    registerFileSystemIpc()
    registerGitIpc()
    registerDevIpc()

    app.on('browser-window-created', (_, window) => {
      optimizer.watchWindowShortcuts(window)
    })

    const mainWindow = createMainWindow({ onHiddenToTray: showTrayHintOnce })
    createPaletteWindow()

    if (!validation.ok) {
      void dialog.showMessageBox(mainWindow, {
        type: 'warning',
        title: 'Hangar',
        message: 'Данные приложения не прошли проверку',
        detail: `${validation.message}\n\nКопия файла сохранена: ${validation.backupPath ?? '-'}`,
      })
    }

    createTray()
    applyGlobalHotkey(SettingsStorage.get().common.globalHotkey)

    let projectsTimer: NodeJS.Timeout | undefined
    store.onDidChange('projects', () => {
      clearTimeout(projectsTimer)
      projectsTimer = setTimeout(
        () => sendToRenderer('projects:changed', store.get('projects')),
        PROJECTS_EVENT_DEBOUNCE_MS,
      )
    })
    store.onDidChange('folders', () => sendToRenderer('folders:changed', store.get('folders')))
    StatusService.onUpdate((health) => sendToRenderer('projects:health', health))
    StatusService.onChecked((checkedAt) => sendToRenderer('projects:checkedAt', checkedAt))

    mainWindow.webContents.once('did-finish-load', () => void StatusService.refresh('force'))
    mainWindow.on('focus', () => void StatusService.onWindowFocus())
    StatusService.applySchedule(() => !!getMainWindow()?.isVisible())

    app.on('activate', function () {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (BrowserWindow.getAllWindows().length === 0) {
        createMainWindow({ onHiddenToTray: showTrayHintOnce })
      } else {
        showMainWindow()
      }
    })
  })

  app.on('before-quit', setQuitting)

  app.on('will-quit', () => {
    globalShortcut.unregisterAll()
  })

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })
}
